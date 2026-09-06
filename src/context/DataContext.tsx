import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Task, Member, TaskStatus, DomainId } from '../types';
import { useAuth } from './AuthContext';
import { db } from '../services/firebase';
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
} from 'firebase/firestore';

interface DataContextType {
  tasks: Task[];
  members: Member[];
  currentUser: Member | null;
  tasksLoading: boolean;
  isAdmin: boolean;
  createTask: (taskData: Omit<Task, 'id' | 'createdAt'>) => Promise<string>;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => Promise<{ success: boolean; message?: string }>;
  updateTask: (taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => Promise<{ success: boolean; message?: string }>;
  deleteTask: (taskId: string) => Promise<{ success: boolean; message?: string }>;
  addMember: (memberData: { name: string; email: string; domainId: DomainId; role?: string }) => Member;
  canEditTaskStatus: (task: Task) => boolean;
  canEditTaskDetails: (task: Task) => boolean;
  canDeleteTask: (task: Task) => boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  const isAdmin = profile?.role === 'ADMIN';

  // Construct current member object from real Firebase user
  const currentUser: Member | null = user
    ? {
        id: user.uid,
        name: profile?.name || user.displayName || 'GRIET Member',
        email: user.email || '',
        domainId: 'tech_team',
        role: profile?.role || 'MEMBER',
        avatarColor: '#4285F4',
        photoURL: profile?.photoURL || user.photoURL,
        joinedAt: new Date().toISOString(),
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
    const tasksQuery = query(collection(db, 'chapterhub_tasks'));

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

          return {
            id: docSnap.id,
            title: data.title || 'Untitled Task',
            description: data.description || '',
            domainId: (data.domainId as DomainId) || 'tech_team',
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
  }, [user]);

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

          return {
            id: docSnap.id,
            name: data.name || 'Club Member',
            email: data.email || '',
            domainId: (data.domainId as DomainId) || 'tech_team',
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
  // 3. Permission Evaluation
  // =========================================================================
  const canEditTaskStatus = (task: Task): boolean => {
    if (!user) return false;
    if (isAdmin) return true;
    if (!task.assignedTo) return true; // Unassigned tasks can be picked up
    return task.assignedTo === user.uid;
  };

  const canEditTaskDetails = (task: Task): boolean => {
    if (!user) return false;
    if (isAdmin) return true;
    return task.createdBy === user.uid;
  };

  const canDeleteTask = (task: Task): boolean => {
    if (!user) return false;
    if (isAdmin) return true;
    return task.createdBy === user.uid;
  };

  // =========================================================================
  // 4. Firestore Task Operations
  // =========================================================================
  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt'>): Promise<string> => {
    if (!user) throw new Error('You must be logged in to create a task.');

    const cleanData = {
      title: taskData.title.trim(),
      description: taskData.description.trim(),
      domainId: taskData.domainId,
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
        message: 'Only the task creator or an Admin can edit this task.',
      };
    }

    try {
      const taskRef = doc(db, 'chapterhub_tasks', taskId);
      const cleanUpdates: Record<string, any> = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      if (updates.status === 'COMPLETED') {
        cleanUpdates.completedAt = serverTimestamp();
      } else if (updates.status) {
        cleanUpdates.completedAt = null;
      }
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
        message: 'Only the task creator or an Admin can delete this task.',
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

  // Local helper for prototype member invitation
  const addMember = (memberData: {
    name: string;
    email: string;
    domainId: DomainId;
    role?: string;
  }): Member => {
    const googleColors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'];
    const randomColor = googleColors[members.length % googleColors.length];

    const newMember: Member = {
      id: 'member-' + Date.now(),
      name: memberData.name.trim(),
      email: memberData.email.trim().toLowerCase(),
      domainId: memberData.domainId,
      role: memberData.role?.trim() || 'Domain Member',
      avatarColor: randomColor,
      joinedAt: new Date().toISOString(),
    };

    setMembers((prev) => [...prev, newMember]);
    return newMember;
  };

  return (
    <DataContext.Provider
      value={{
        tasks,
        members,
        currentUser,
        tasksLoading,
        isAdmin,
        createTask,
        updateTaskStatus,
        updateTask,
        deleteTask,
        addMember,
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
