export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'TEAM_MEMBER';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl: string;
  jobTitle: string;
  department?: string;
  createdAt: string;
}

export type ProjectPriority = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
export type ProjectStatus = 'PLANIFICACION' | 'EN_PROGRESO' | 'EN_PAUSA' | 'CONCLUIDO' | 'CANCELADO';

export interface ProjectAssistant {
  id: string;
  projectId: string;
  userId: string;
  responsibility: string;
  createdAt: string;
  // Joined fields for display
  user?: User;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  responsibility: string;
  createdAt: string;
  // Joined fields for display
  user?: User;
}

export interface Project {
  id: string;
  code: string; // e.g. PRJ-2026-001
  title: string;
  summary: string;
  objectives: string[];
  priority: ProjectPriority;
  status: ProjectStatus;
  startDate: string; // YYYY-MM-DD
  targetDate: string; // YYYY-MM-DD
  managerId: string;
  archived: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;

  // Populated relations
  manager?: User;
  assistants?: ProjectAssistant[];
  members?: ProjectMember[];
  tasksCount?: number;
  completedTasksCount?: number;
  calculatedProgress?: number | null; // null if no active tasks
}

export type TaskStatus = 'PENDIENTE' | 'EN_PROGRESO' | 'CONCLUIDO' | 'CANCELADO';
export type TaskPriority = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: string; // ISO date-time
}

export interface Task {
  id: string;
  code: string; // e.g. TSK-0101
  projectId: string;
  title: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  assigneeId: string;
  progress: number; // 0 - 100
  status: TaskStatus;
  priority: TaskPriority;
  archived: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;

  // Populated fields
  assignee?: User;
  project?: {
    id: string;
    code: string;
    title: string;
  };
  comments?: TaskComment[];
  commentsCount?: number;
  isOverdue?: boolean;
}

export interface ActivityLog {
  id: string;
  projectId?: string;
  taskId?: string;
  userId: string;
  userName: string;
  actionType:
    | 'PROJECT_CREATED'
    | 'PROJECT_UPDATED'
    | 'PROJECT_DELETED'
    | 'PROJECT_RESTORED'
    | 'TASK_CREATED'
    | 'TASK_UPDATED'
    | 'TASK_STATUS_CHANGED'
    | 'TASK_PROGRESS_CHANGED'
    | 'TASK_DELETED'
    | 'TASK_RESTORED'
    | 'COMMENT_ADDED'
    | 'ASSISTANT_ADDED'
    | 'ASSISTANT_REMOVED'
    | 'MEMBER_ADDED'
    | 'MEMBER_REMOVED';
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId?: string; // Target user or global
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface DatabaseSchema {
  users: User[];
  projects: Project[];
  projectAssistants: ProjectAssistant[];
  projectMembers: ProjectMember[];
  tasks: Task[];
  comments: TaskComment[];
  activityLogs: ActivityLog[];
  notifications: NotificationItem[];
}

export interface ReportFilterOptions {
  projectId?: string;
  managerId?: string;
  assistantUserId?: string;
  assigneeId?: string;
  taskStatus?: TaskStatus | 'TODOS';
  startDateFrom?: string;
  startDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  onlyOverdue?: boolean;
  priority?: TaskPriority | 'TODAS';
}

export interface SystemStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  cancelledProjects: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  totalTasks: number;
}
