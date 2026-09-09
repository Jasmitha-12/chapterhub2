import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Task, Member, TaskStatus, DomainId, CalendarEvent, EventType } from '../types';
import { useAuth } from './AuthContext';
import { db } from '../services/firebase';
import { DOMAINS } from '../data/domains';
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';

interface DataContextType {
  tasks: Task[];
  members: Member[];
  events: CalendarEvent[];
  currentUser: Member | null;
  tasksLoading: boolean;
  eventsLoading: boolean;
  isAdmin: boolean;
  createTask: (taskData: Omit<Task, 'id' | 'createdAt'>) => Promise<string>;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => Promise<{ success: boolean; message?: string }>;
  updateTask: (taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => Promise<{ success: boolean; message?: string }>;
  deleteTask: (taskId: string) => Promise<{ success: boolean; message?: string }>;
  createEvent: (eventData: Omit<CalendarEvent, 'id' | 'createdAt'>) => Promise<{ success: boolean; id?: string; message?: string }>;
  updateEvent: (eventId: string, updates: Partial<Omit<CalendarEvent, 'id' | 'createdAt'>>) => Promise<{ success: boolean; message?: string }>;
  deleteEvent: (eventId: string) => Promise<{ success: boolean; message?: string }>;
  updateMemberRole: (memberId: string, newRole: 'ADMIN' | 'MEMBER') => Promise<{ success: boolean; message?: string }>;
  updateMemberDomain: (memberId: string, domainId: DomainId) => Promise<{ success: boolean; message?: string }>;
  updateMemberYear: (memberId: string, year: string) => Promise<{ success: boolean; message?: string }>;
  deleteMember: (memberId: string) => Promise<{ success: boolean; message?: string }>;
  canEditTaskStatus: (task: Task) => boolean;
  canEditTaskDetails: (task: Task) => boolean;
  canDeleteTask: (task: Task) => boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Derive real-time role directly from Firestore member snapshot with fallback to initial profile
  const currentMember = members.find((m) => m.id === user?.uid);
  const activeRole = (currentMember?.role || profile?.role || 'MEMBER').toUpperCase();
  const isAdmin = activeRole === 'ADMIN';

  const userDomainName =
    currentMember?.domain ||
    profile?.domain ||
    DOMAINS.find((d) => d.id === (currentMember?.domainId || profile?.domainId))?.name ||
    'Tech Team';

  const userDomainId: DomainId =
    currentMember?.domainId ||
    (profile?.domainId as DomainId) ||
    (DOMAINS.find((d) => d.name === (currentMember?.domain || profile?.domain))?.id as DomainId) ||
    'tech_team';

  // Construct current member object from real Firebase user and Firestore profile
  const currentUser: Member | null = user
    ? {
        id: user.uid,
        name: profile?.name || user.displayName || 'GRIET Member',
        email: user.email || '',
        domainId: userDomainId,
        domain: userDomainName,
        year: currentMember?.year || profile?.year || undefined,
        role: activeRole,
        avatarColor: '#4285F4',
        photoURL: profile?.photoURL || user.photoURL,
        joinedAt: currentMember?.joinedAt || new Date().toISOString(),
      }
    : null;

  // =========================================================================
  // 1. Real-time Tasks Listener: chapterhub_tasks
  // =========================================================================
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setTasksLoading(false);
      return;
    }

    setTasksLoading(true);

    let tasksQuery;
    if (isAdmin) {
      tasksQuery = query(collection(db, 'chapterhub_tasks'));
    } else {
      const memberDomain =
        currentMember?.domain ||
        profile?.domain ||
        DOMAINS.find((d) => d.id === (currentMember?.domainId || profile?.domainId))?.name;

      if (!memberDomain) {
        // Member has not completed onboarding yet or domain not loaded
        setTasks([]);
        setTasksLoading(false);
        return;
      }

      tasksQuery = query(
        collection(db, 'chapterhub_tasks'),
        where('domain', '==', memberDomain)
      );
    }

    const unsubscribeTasks = onSnapshot(
      tasksQuery,
      (snapshot) => {
        const fetchedTasks: Task[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();

          const parseTime = (val: any): string => {
            if (!val) return '';
            if (val.toDate) return val.toDate().toISOString();
            if (typeof val === 'string') return val;
            return new Date().toISOString();
          };

          const rawDomain = data.domain || data.domainId;
          const matchedDomain = DOMAINS.find(
            (d) =>
              d.name.toLowerCase() === (rawDomain || '').toLowerCase() ||
              d.id === (rawDomain || '').toLowerCase() ||
              d.id === data.domainId ||
              d.name === data.domain
          );

          return {
            id: docSnap.id,
            title: data.title || 'Untitled Task',
            description: data.description || '',
            domainId: matchedDomain?.id || (data.domainId as DomainId) || 'tech_team',
            domain: data.domain || matchedDomain?.name || 'Tech Team',
            subTrack: data.subTrack || undefined,
            assignedTo: data.assignedTo || undefined,
            priority: data.priority || 'MEDIUM',
            status: (data.status as TaskStatus) || 'NOT_STARTED',
            deadline: data.deadline || '',
            createdBy: data.createdBy,
            createdAt: parseTime(data.createdAt) || new Date().toISOString(),
            updatedAt: parseTime(data.updatedAt) || undefined,
            completedAt: parseTime(data.completedAt) || undefined,
          };
        });

        // Sort by deadline ascending, then creation time
        fetchedTasks.sort((a, b) => {
          if (a.deadline && b.deadline) {
            return a.deadline.localeCompare(b.deadline);
          }
          return b.createdAt.localeCompare(a.createdAt);
        });

        console.log(`[ChapterHub] Synchronized ${fetchedTasks.length} tasks from Firestore in real-time.`);
        setTasks(fetchedTasks);
        setTasksLoading(false);
      },
      (err) => {
        console.error('[ChapterHub] Firestore tasks listener error:', err);
        setTasksLoading(false);
      }
    );

    return () => unsubscribeTasks();
  }, [user, isAdmin, currentMember?.domain, profile?.domain, currentMember?.domainId, profile?.domainId]);

  // =========================================================================
  // 2. Real-time Members Listener: chapterhub_users
  // =========================================================================
  useEffect(() => {
    if (!user) {
      setMembers([]);
      return;
    }

    const usersRef = collection(db, 'chapterhub_users');

    const unsubscribeUsers = onSnapshot(
      usersRef,
      (snapshot) => {
        const googleColors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'];

        const fetchedMembers: Member[] = snapshot.docs.map((docSnap, index) => {
          const data = docSnap.data();
          const parseTime = (val: any): string => {
            if (!val) return new Date().toISOString();
            if (val.toDate) return val.toDate().toISOString();
            if (typeof val === 'string') return val;
            return new Date().toISOString();
          };

          const rawDomain = data.domain || data.domainId;
          const matchedDomain = DOMAINS.find(
            (d) =>
              d.name.toLowerCase() === (rawDomain || '').toLowerCase() ||
              d.id === (rawDomain || '').toLowerCase() ||
              d.id === data.domainId ||
              d.name === data.domain
          );

          return {
            id: docSnap.id,
            name: data.name || 'Club Member',
            email: data.email || '',
            domainId: matchedDomain?.id || (data.domainId as DomainId) || 'tech_team',
            domain: data.domain || matchedDomain?.name || 'Tech Team',
            year: data.year || undefined,
            role: data.role || 'MEMBER',
            photoURL: data.photoURL || null,
            avatarColor: googleColors[index % googleColors.length],
            joinedAt: parseTime(data.createdAt),
          };
        });

        // Ensure current user is always included even before doc completes
        if (currentUser && !fetchedMembers.some((m) => m.id === currentUser.id)) {
          fetchedMembers.unshift(currentUser);
        }

        console.log(`[ChapterHub] Synchronized ${fetchedMembers.length} real members from Firestore.`);
        setMembers(fetchedMembers);
      },
      (err) => {
        console.warn('[ChapterHub] Firestore chapterhub_users directory listener:', err);
      }
    );

    return () => unsubscribeUsers();
  }, [user, currentUser?.id]);

  // =========================================================================
  // 3. Real-time Events Listener: chapterhub_events
  // =========================================================================
  useEffect(() => {
    if (!user) {
      setEvents([]);
      setEventsLoading(false);
      return;
    }

    setEventsLoading(true);
    const eventsQuery = query(collection(db, 'chapterhub_events'));

    const unsubscribeEvents = onSnapshot(
      eventsQuery,
      (snapshot) => {
        const parseTime = (val: any): string => {
          if (!val) return '';
          if (val.toDate) return val.toDate().toISOString();
          if (typeof val === 'string') return val;
          return new Date().toISOString();
        };

        const fetchedEvents: CalendarEvent[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.title || 'Untitled Event',
            description: data.description || '',
            date: data.date || '',
            startTime: data.startTime || null,
            endTime: data.endTime || null,
            type: (data.type as EventType) || 'GENERAL',
            domainId: (data.domainId as DomainId) || null,
            createdBy: data.createdBy,
            createdAt: parseTime(data.createdAt) || new Date().toISOString(),
            updatedAt: parseTime(data.updatedAt) || undefined,
          };
        });

        // Sort by date ascending, then start time
        fetchedEvents.sort((a, b) => {
          const dateDiff = a.date.localeCompare(b.date);
          if (dateDiff !== 0) return dateDiff;
          return (a.startTime || '').localeCompare(b.startTime || '');
        });

        console.log(`[ChapterHub] Synchronized ${fetchedEvents.length} events from Firestore in real-time.`);
        setEvents(fetchedEvents);
        setEventsLoading(false);
      },
      (err) => {
        console.error('[ChapterHub] Firestore chapterhub_events listener error:', err);
        setEventsLoading(false);
      }
    );

    return () => unsubscribeEvents();
  }, [user]);

  // =========================================================================
  // 3. Permission Evaluation
  // =========================================================================
  // MEMBER can update status only on tasks explicitly assigned to their UID.
  // Unassigned tasks are status-locked for non-admins (Firestore rules enforce the same).
  const canEditTaskStatus = (task: Task): boolean => {
    if (!user) return false;
    if (isAdmin) return true;
    return !!task.assignedTo && task.assignedTo === user.uid;
  };

  // Only ADMIN can edit task details (matches Firestore rules: only isAdmin() for full update).
  const canEditTaskDetails = (_task: Task): boolean => {
    if (!user) return false;
    return isAdmin;
  };

  // Only ADMIN can delete tasks (matches Firestore rules: only isAdmin() for delete).
  const canDeleteTask = (_task: Task): boolean => {
    if (!user) return false;
    return isAdmin;
  };

  // =========================================================================
  // 4. Firestore Task Operations
  // =========================================================================
  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt'>): Promise<string> => {
    if (!user) throw new Error('You must be logged in to create a task.');

    const domainObj = DOMAINS.find(
      (d) => d.id === taskData.domainId || d.name === taskData.domain || d.name === taskData.domainId
    );
    const domainName = domainObj?.name || taskData.domain || 'Tech Team';
    const domainId = domainObj?.id || taskData.domainId || 'tech_team';

    const cleanData = {
      title: taskData.title.trim(),
      description: taskData.description.trim(),
      domain: domainName,
      domainId: domainId,
      subTrack: taskData.subTrack || null,
      assignedTo: taskData.assignedTo || null,
      priority: taskData.priority,
      status: taskData.status,
      deadline: taskData.deadline,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      completedAt: taskData.status === 'COMPLETED' ? serverTimestamp() : null,
    };

    console.log('[ChapterHub] Writing new task to Firestore chapterhub_tasks...', cleanData);
    const docRef = await addDoc(collection(db, 'chapterhub_tasks'), cleanData);
    console.log('[ChapterHub] Created task successfully with ID:', docRef.id);
    return docRef.id;
  };

  const updateTaskStatus = async (
    taskId: string,
    newStatus: TaskStatus
  ): Promise<{ success: boolean; message?: string }> => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return { success: false, message: 'Task not found.' };

    if (!canEditTaskStatus(targetTask)) {
      const assigned = members.find((m) => m.id === targetTask.assignedTo);
      const assigneeName = assigned ? assigned.name : 'assigned member';
      return {
        success: false,
        message: `Only ${assigneeName} or an Admin can update this task.`,
      };
    }

    try {
      const taskRef = doc(db, 'chapterhub_tasks', taskId);
      await updateDoc(taskRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        completedAt: newStatus === 'COMPLETED' ? serverTimestamp() : null,
      });
      console.log(`[ChapterHub] Updated task ${taskId} status to ${newStatus}`);
      return { success: true };
    } catch (err: any) {
      console.error('[ChapterHub] Failed to update task status in Firestore:', err);
      return { success: false, message: err.message || 'Failed to update task status in Firestore.' };
    }
  };

  const updateTask = async (
    taskId: string,
    updates: Partial<Omit<Task, 'id' | 'createdAt'>>
  ): Promise<{ success: boolean; message?: string }> => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return { success: false, message: 'Task not found.' };

    if (!canEditTaskDetails(targetTask)) {
      return {
        success: false,
        message: 'Only an Admin can edit task details.',
      };
    }

    try {
      const taskRef = doc(db, 'chapterhub_tasks', taskId);
      const cleanUpdates: Record<string, any> = {
        updatedAt: serverTimestamp(),
      };
      if (updates.title !== undefined) cleanUpdates.title = updates.title.trim();
      if (updates.description !== undefined) cleanUpdates.description = updates.description.trim();
      if (updates.domainId !== undefined || updates.domain !== undefined) {
        const rawDomain = updates.domainId || updates.domain;
        const domainObj = DOMAINS.find(
          (d) => d.id === rawDomain || d.name === rawDomain
        );
        cleanUpdates.domain = domainObj?.name || updates.domain || 'Tech Team';
        cleanUpdates.domainId = domainObj?.id || updates.domainId || 'tech_team';
      }
      if (updates.subTrack !== undefined) cleanUpdates.subTrack = updates.subTrack || null;
      if (updates.assignedTo !== undefined) cleanUpdates.assignedTo = updates.assignedTo || null;
      if (updates.priority !== undefined) cleanUpdates.priority = updates.priority;
      if (updates.status !== undefined) {
        cleanUpdates.status = updates.status;
        if (updates.status === 'COMPLETED') {
          cleanUpdates.completedAt = serverTimestamp();
        } else {
          cleanUpdates.completedAt = null;
        }
      }
      if (updates.deadline !== undefined) cleanUpdates.deadline = updates.deadline;

      await updateDoc(taskRef, cleanUpdates);
      console.log(`[ChapterHub] Successfully updated task ${taskId}`);
      return { success: true };
    } catch (err: any) {
      console.error('[ChapterHub] Failed to update task in Firestore:', err);
      return { success: false, message: err.message || 'Failed to update task.' };
    }
  };

  const deleteTask = async (taskId: string): Promise<{ success: boolean; message?: string }> => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return { success: false, message: 'Task not found.' };

    if (!canDeleteTask(targetTask)) {
      return {
        success: false,
        message: 'Only an Admin can delete tasks.',
      };
    }

    try {
      const taskRef = doc(db, 'chapterhub_tasks', taskId);
      await deleteDoc(taskRef);
      console.log(`[ChapterHub] Deleted task ${taskId} from Firestore.`);
      return { success: true };
    } catch (err: any) {
      console.error('[ChapterHub] Failed to delete task in Firestore:', err);
      return { success: false, message: err.message || 'Failed to delete task in Firestore.' };
    }
  };

  // =========================================================================
  // 5. Firestore Event Operations (Admin Only)
  // =========================================================================
  const createEvent = async (
    eventData: Omit<CalendarEvent, 'id' | 'createdAt'>
  ): Promise<{ success: boolean; id?: string; message?: string }> => {
    if (!user) return { success: false, message: 'You must be logged in to create an event.' };
    if (!isAdmin) return { success: false, message: 'Only an Admin can create events.' };

    if (!eventData.title.trim()) return { success: false, message: 'Event title is required.' };
    if (!eventData.date) return { success: false, message: 'Event date is required.' };

    try {
      const cleanData = {
        title: eventData.title.trim(),
        description: (eventData.description || '').trim(),
        date: eventData.date,
        startTime: eventData.startTime || null,
        endTime: eventData.endTime || null,
        type: eventData.type || 'GENERAL',
        domainId: eventData.domainId || null,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'chapterhub_events'), cleanData);
      console.log(`[ChapterHub] Created event ${docRef.id} in Firestore.`);
      return { success: true, id: docRef.id };
    } catch (err: any) {
      console.error('[ChapterHub] Failed to create event in Firestore:', err);
      return { success: false, message: err.message || 'Failed to create event.' };
    }
  };

  const updateEvent = async (
    eventId: string,
    updates: Partial<Omit<CalendarEvent, 'id' | 'createdAt'>>
  ): Promise<{ success: boolean; message?: string }> => {
    if (!user) return { success: false, message: 'You must be logged in to update an event.' };
    if (!isAdmin) return { success: false, message: 'Only an Admin can edit events.' };

    try {
      const eventRef = doc(db, 'chapterhub_events', eventId);
      const cleanUpdates: Record<string, any> = {
        updatedAt: serverTimestamp(),
      };

      if (updates.title !== undefined) cleanUpdates.title = updates.title.trim();
      if (updates.description !== undefined) cleanUpdates.description = updates.description.trim();
      if (updates.date !== undefined) cleanUpdates.date = updates.date;
      if (updates.startTime !== undefined) cleanUpdates.startTime = updates.startTime || null;
      if (updates.endTime !== undefined) cleanUpdates.endTime = updates.endTime || null;
      if (updates.type !== undefined) cleanUpdates.type = updates.type;
      if (updates.domainId !== undefined) cleanUpdates.domainId = updates.domainId || null;

      await updateDoc(eventRef, cleanUpdates);
      console.log(`[ChapterHub] Successfully updated event ${eventId}`);
      return { success: true };
    } catch (err: any) {
      console.error('[ChapterHub] Failed to update event in Firestore:', err);
      return { success: false, message: err.message || 'Failed to update event.' };
    }
  };

  const deleteEvent = async (eventId: string): Promise<{ success: boolean; message?: string }> => {
    if (!user) return { success: false, message: 'You must be logged in to delete an event.' };
    if (!isAdmin) return { success: false, message: 'Only an Admin can delete events.' };

    try {
      const eventRef = doc(db, 'chapterhub_events', eventId);
      await deleteDoc(eventRef);
      console.log(`[ChapterHub] Successfully deleted event ${eventId}`);
      return { success: true };
    } catch (err: any) {
      console.error('[ChapterHub] Failed to delete event in Firestore:', err);
      return { success: false, message: err.message || 'Failed to delete event.' };
    }
  };

  // =========================================================================
  // 6. Member Management Operations (Admin Only)
  // =========================================================================
  const updateMemberRole = async (
    memberId: string,
    newRole: 'ADMIN' | 'MEMBER'
  ): Promise<{ success: boolean; message?: string }> => {
    if (!user) return { success: false, message: 'You must be logged in.' };
    if (!isAdmin) return { success: false, message: 'Only an Admin can change member roles.' };

    try {
      const userRef = doc(db, 'chapterhub_users', memberId);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: serverTimestamp(),
      });
      console.log(`[ChapterHub] Member ${memberId} role updated to ${newRole}`);
      return { success: true };
    } catch (err: any) {
      console.error('[ChapterHub] Failed to update member role:', err);
      return { success: false, message: err.message || 'Failed to update member role in Firestore.' };
    }
  };

  const updateMemberDomain = async (
    memberId: string,
    domainId: DomainId
  ): Promise<{ success: boolean; message?: string }> => {
    if (!user) return { success: false, message: 'You must be logged in.' };
    if (!isAdmin) return { success: false, message: 'Only an Admin can change member domains.' };

    const domainName = DOMAINS.find((d) => d.id === domainId)?.name || 'Tech Team';

    try {
      const userRef = doc(db, 'chapterhub_users', memberId);
      await updateDoc(userRef, {
        domainId,
        domain: domainName,
        updatedAt: serverTimestamp(),
      });
      console.log(`[ChapterHub] Member ${memberId} domain updated to ${domainName}`);
      return { success: true };
    } catch (err: any) {
      console.error('[ChapterHub] Failed to update member domain:', err);
      return { success: false, message: err.message || 'Failed to update member domain in Firestore.' };
    }
  };

  const updateMemberYear = async (
    memberId: string,
    year: string
  ): Promise<{ success: boolean; message?: string }> => {
    if (!user) return { success: false, message: 'You must be logged in.' };
    if (!isAdmin) return { success: false, message: 'Only an Admin can change member years.' };

    try {
      const userRef = doc(db, 'chapterhub_users', memberId);
      await updateDoc(userRef, {
        year,
        updatedAt: serverTimestamp(),
      });
      console.log(`[ChapterHub] Member ${memberId} year updated to ${year}`);
      return { success: true };
    } catch (err: any) {
      console.error('[ChapterHub] Failed to update member year:', err);
      return { success: false, message: err.message || 'Failed to update member year in Firestore.' };
    }
  };

  const deleteMember = async (
    memberId: string
  ): Promise<{ success: boolean; message?: string }> => {
    if (!user) return { success: false, message: 'You must be logged in.' };
    if (!isAdmin) return { success: false, message: 'Only an Admin can remove members.' };
    if (memberId === user.uid) {
      return { success: false, message: 'You cannot remove your own admin profile.' };
    }

    try {
      const userRef = doc(db, 'chapterhub_users', memberId);
      await deleteDoc(userRef);
      console.log(`[ChapterHub] Member ${memberId} deleted from chapterhub_users.`);
      return { success: true };
    } catch (err: any) {
      console.error('[ChapterHub] Failed to delete member from Firestore:', err);
      return { success: false, message: err.message || 'Failed to delete member from Firestore.' };
    }
  };

  return (
    <DataContext.Provider
      value={{
        tasks,
        members,
        events,
        currentUser,
        tasksLoading,
        eventsLoading,
        isAdmin,
        createTask,
        updateTaskStatus,
        updateTask,
        deleteTask,
        createEvent,
        updateEvent,
        deleteEvent,
        updateMemberRole,
        updateMemberDomain,
        updateMemberYear,
        deleteMember,
        canEditTaskStatus,
        canEditTaskDetails,
        canDeleteTask,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
