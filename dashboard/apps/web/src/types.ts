export type Role = 'ADMIN' | 'PM' | 'DEVELOPER';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  description: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  dueDate: string | null;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  projectId: string;
  taskId: string | null;
  actorId: string;
  actorName: string;
  action: string;
  fromValue: string | null;
  toValue: string | null;
  message: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  taskId: string | null;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}
