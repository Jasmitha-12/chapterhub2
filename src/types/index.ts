export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type DomainId =
  | 'documentation'
  | 'sponsorship'
  | 'marketing'
  | 'logistics'
  | 'social_media'
  | 'event_management'
  | 'tech_team'
  | 'creative';

export interface Domain {
  id: DomainId;
  name: string;
  description: string;
  color: string;
  subTracks?: string[];
  icon: string;
}

export interface Member {
  id: string; // Firebase UID
  name: string;
  email: string;
  domainId: DomainId;
  role: string;
  avatarColor: string;
  photoURL?: string | null;
  joinedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  domainId: DomainId;
  subTrack?: string;
  assignedTo?: string; // Member / User UID
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string; // YYYY-MM-DD
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}

export type Theme = 'light' | 'dark';
