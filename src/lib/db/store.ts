import fs from 'fs';
import path from 'path';
import { DatabaseSchema, Project, Task, User, ProjectAssistant, ProjectMember, TaskComment, ActivityLog, NotificationItem, SystemStats, TaskStatus } from '../types';
import { initialDatabase } from './seed-data';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'pms_db.json');

// Helper to ensure data folder and database file exist
function getDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    saveDb(initialDatabase);
    return initialDatabase;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (error) {
    console.error('Error reading database, fallback to initial:', error);
    saveDb(initialDatabase);
    return initialDatabase;
  }
}

// Atomic save to file
function saveDb(data: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

// Helper to determine if a task is overdue
export function isTaskOverdue(task: Task): boolean {
  if (task.status === 'CONCLUIDO' || task.status === 'CANCELADO' || task.deletedAt) {
    return false;
  }
  const today = new Date().toISOString().split('T')[0];
  return task.dueDate < today;
}

// Rule 9: Calculate overall project progress
// Average of percentages of all active tasks (excluding cancelled tasks and deleted tasks).
// If no active tasks -> null (sin progreso calculable)
export function calculateProjectProgress(projectId: string, tasks: Task[]): number | null {
  const activeTasks = tasks.filter(
    (t) => t.projectId === projectId && !t.deletedAt && t.status !== 'CANCELADO'
  );

  if (activeTasks.length === 0) {
    return null;
  }

  const sum = activeTasks.reduce((acc, curr) => acc + (curr.progress || 0), 0);
  return Math.round(sum / activeTasks.length);
}

// -------------------------------------------------------------
// USERS CRUD
// -------------------------------------------------------------
export function getUsers(): User[] {
  const db = getDb();
  return db.users;
}

export function getUserById(id: string): User | undefined {
  const db = getDb();
  return db.users.find((u) => u.id === id);
}

export function createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
  const db = getDb();
  // Check duplication by email
  const existing = db.users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());
  if (existing) {
    throw new Error(`Ya existe un usuario registrado con el correo ${userData.email}`);
  }

  const newUser: User = {
    ...userData,
    id: `user-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDb(db);
  return newUser;
}

export function updateUser(id: string, updates: Partial<User>): User {
  const db = getDb();
  const index = db.users.findIndex((u) => u.id === id);
  if (index === -1) throw new Error('Usuario no encontrado');

  if (updates.email) {
    const duplicate = db.users.find(
      (u) => u.email.toLowerCase() === updates.email!.toLowerCase() && u.id !== id
    );
    if (duplicate) {
      throw new Error(`El correo ${updates.email} ya está en uso por otro usuario`);
    }
  }

  db.users[index] = { ...db.users[index], ...updates };
  saveDb(db);
  return db.users[index];
}

export function deleteUser(id: string, actorUserId?: string): void {
  const db = getDb();
  const user = db.users.find((u) => u.id === id);
  if (!user) throw new Error('Usuario no encontrado');

  // Remove from users list
  db.users = db.users.filter((u) => u.id !== id);

  // Find fallback manager/user if any remaining
  const fallbackManager = db.users.find((u) => u.role === 'PROJECT_MANAGER' || u.role === 'ADMIN')?.id || db.users[0]?.id || '';

  // Gracefully reassign any project where this user was the manager
  db.projects = db.projects.map((p) => {
    if (p.managerId === id) {
      return {
        ...p,
        managerId: fallbackManager,
        updatedAt: new Date().toISOString(),
      };
    }
    return p;
  });

  // Remove from assistants and project members
  db.projectAssistants = db.projectAssistants.filter((a) => a.userId !== id);
  db.projectMembers = db.projectMembers.filter((m) => m.userId !== id);

  // Reassign tasks if any
  db.tasks = db.tasks.map((t) => (t.assigneeId === id ? { ...t, assigneeId: fallbackManager } : t));

  saveDb(db);

  if (actorUserId) {
    logActivity('MEMBER_REMOVED', `Eliminó al usuario "${user.fullName}" (${user.email}) del directorio corporativo`, actorUserId);
  }
}

// -------------------------------------------------------------
// PROJECTS CRUD
// -------------------------------------------------------------
export function getProjects(options?: { includeDeleted?: boolean; archived?: boolean }): Project[] {
  const db = getDb();
  let list = db.projects;

  if (!options?.includeDeleted) {
    list = list.filter((p) => !p.deletedAt);
  } else {
    // If includeDeleted is true and we only want deleted ones (trash bin)
    list = list.filter((p) => Boolean(p.deletedAt));
  }

  if (options?.archived !== undefined) {
    list = list.filter((p) => p.archived === options.archived);
  }

  return list.map((p) => populateProject(p, db));
}

export function getProjectById(id: string, includeDeleted = false): Project | null {
  const db = getDb();
  const project = db.projects.find((p) => p.id === id || p.code === id);
  if (!project) return null;
  if (!includeDeleted && project.deletedAt) return null;
  return populateProject(project, db);
}

function populateProject(p: Project, db: DatabaseSchema): Project {
  const manager = db.users.find((u) => u.id === p.managerId);
  const assistants = db.projectAssistants
    .filter((a) => a.projectId === p.id)
    .map((a) => ({
      ...a,
      user: db.users.find((u) => u.id === a.userId),
    }));
  const members = db.projectMembers
    .filter((m) => m.projectId === p.id)
    .map((m) => ({
      ...m,
      user: db.users.find((u) => u.id === m.userId),
    }));

  const activeProjectTasks = db.tasks.filter((t) => t.projectId === p.id && !t.deletedAt);
  const completedTasks = activeProjectTasks.filter((t) => t.status === 'CONCLUIDO');
  const calculatedProgress = calculateProjectProgress(p.id, db.tasks);

  return {
    ...p,
    manager,
    assistants,
    members,
    tasksCount: activeProjectTasks.length,
    completedTasksCount: completedTasks.length,
    calculatedProgress,
  };
}

export function createProject(
  data: Omit<Project, 'id' | 'code' | 'archived' | 'deletedAt' | 'createdAt' | 'updatedAt'> & {
    assistantIds?: { userId: string; responsibility: string }[];
    memberIds?: { userId: string; responsibility: string }[];
  }
): Project {
  const db = getDb();
  const nextSeq = db.projects.length + 1;
  const currentYear = new Date().getFullYear();
  const code = `PRJ-${currentYear}-${String(nextSeq).padStart(3, '0')}`;
  const now = new Date().toISOString();

  const newProject: Project = {
    id: `prj-${Date.now()}`,
    code,
    title: data.title,
    summary: data.summary,
    objectives: data.objectives || [],
    priority: data.priority,
    status: data.status,
    startDate: data.startDate,
    targetDate: data.targetDate,
    managerId: data.managerId,
    archived: false,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  db.projects.push(newProject);

  // Add assistants
  if (data.assistantIds && data.assistantIds.length > 0) {
    for (const ast of data.assistantIds) {
      db.projectAssistants.push({
        id: `ast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        projectId: newProject.id,
        userId: ast.userId,
        responsibility: ast.responsibility,
        createdAt: now,
      });
    }
  }

  // Add members
  if (data.memberIds && data.memberIds.length > 0) {
    for (const mem of data.memberIds) {
      db.projectMembers.push({
        id: `pmem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        projectId: newProject.id,
        userId: mem.userId,
        responsibility: mem.responsibility,
        createdAt: now,
      });
    }
  }

  saveDb(db);
  logActivity('PROJECT_CREATED', `Creó el proyecto "${newProject.title}" (${newProject.code})`, data.managerId, newProject.id);

  return populateProject(newProject, db);
}

export function updateProject(
  id: string,
  updates: Partial<Project> & { assistantIds?: { userId: string; responsibility: string }[] },
  actorUserId?: string
): Project {
  const db = getDb();
  const index = db.projects.findIndex((p) => p.id === id);
  if (index === -1) throw new Error('Proyecto no encontrado');

  const prev = db.projects[index];
  const now = new Date().toISOString();

  // Sync assistantIds if provided
  if (updates.assistantIds !== undefined) {
    db.projectAssistants = db.projectAssistants.filter((a) => a.projectId !== id);
    for (const ast of updates.assistantIds) {
      db.projectAssistants.push({
        id: `ast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        projectId: id,
        userId: ast.userId,
        responsibility: ast.responsibility,
        createdAt: now,
      });
    }
  }

  const { assistantIds, ...projectFields } = updates;

  db.projects[index] = {
    ...prev,
    ...projectFields,
    updatedAt: now,
  };

  saveDb(db);

  if (actorUserId) {
    logActivity('PROJECT_UPDATED', `Actualizó el proyecto "${db.projects[index].title}"`, actorUserId, id);
  }

  return populateProject(db.projects[index], db);
}

export function softDeleteProject(id: string, actorUserId?: string): void {
  const db = getDb();
  const project = db.projects.find((p) => p.id === id);
  if (!project) throw new Error('Proyecto no encontrado');

  project.deletedAt = new Date().toISOString();
  saveDb(db);

  if (actorUserId) {
    logActivity('PROJECT_DELETED', `Movió a la papelera el proyecto "${project.title}"`, actorUserId, id);
  }
}

export function restoreProject(id: string, actorUserId?: string): void {
  const db = getDb();
  const project = db.projects.find((p) => p.id === id);
  if (!project) throw new Error('Proyecto no encontrado');

  project.deletedAt = null;
  saveDb(db);

  if (actorUserId) {
    logActivity('PROJECT_RESTORED', `Restauró de la papelera el proyecto "${project.title}"`, actorUserId, id);
  }
}

export function hardDeleteProject(id: string): void {
  const db = getDb();
  db.projects = db.projects.filter((p) => p.id !== id);
  // Cascade delete assistants, members, tasks, comments
  db.projectAssistants = db.projectAssistants.filter((a) => a.projectId !== id);
  db.projectMembers = db.projectMembers.filter((m) => m.projectId !== id);
  const projectTaskIds = db.tasks.filter((t) => t.projectId === id).map((t) => t.id);
  db.tasks = db.tasks.filter((t) => t.projectId !== id);
  db.comments = db.comments.filter((c) => !projectTaskIds.includes(c.taskId));
  saveDb(db);
}

// -------------------------------------------------------------
// DIRECTION & ASSISTANTS
// -------------------------------------------------------------
export function addAssistant(projectId: string, userId: string, responsibility: string, actorUserId?: string): ProjectAssistant {
  const db = getDb();
  const project = db.projects.find((p) => p.id === projectId);
  if (!project) throw new Error('Proyecto no encontrado');

  // Prevent duplicate assistant for same project
  const existing = db.projectAssistants.find((a) => a.projectId === projectId && a.userId === userId);
  if (existing) {
    throw new Error('Este usuario ya está registrado como asistente en este proyecto');
  }

  const assistant: ProjectAssistant = {
    id: `ast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    projectId,
    userId,
    responsibility,
    createdAt: new Date().toISOString(),
  };

  db.projectAssistants.push(assistant);
  saveDb(db);

  const user = db.users.find((u) => u.id === userId);
  if (actorUserId) {
    logActivity('ASSISTANT_ADDED', `Añadió a ${user?.fullName || 'usuario'} como Asistente en "${project.title}" (${responsibility})`, actorUserId, projectId);
  }

  return { ...assistant, user };
}

export function updateAssistant(assistantId: string, responsibility: string): ProjectAssistant {
  const db = getDb();
  const ast = db.projectAssistants.find((a) => a.id === assistantId);
  if (!ast) throw new Error('Asistente no encontrado');

  ast.responsibility = responsibility;
  saveDb(db);

  const user = db.users.find((u) => u.id === ast.userId);
  return { ...ast, user };
}

export function removeAssistant(assistantId: string, actorUserId?: string): void {
  const db = getDb();
  const ast = db.projectAssistants.find((a) => a.id === assistantId);
  if (!ast) throw new Error('Asistente no encontrado');

  db.projectAssistants = db.projectAssistants.filter((a) => a.id !== assistantId);
  saveDb(db);

  if (actorUserId) {
    const user = db.users.find((u) => u.id === ast.userId);
    logActivity('ASSISTANT_REMOVED', `Removió a ${user?.fullName || 'asistente'} del proyecto`, actorUserId, ast.projectId);
  }
}

// -------------------------------------------------------------
// TEAM MEMBERS
// -------------------------------------------------------------
export function addMemberToProject(projectId: string, userId: string, responsibility: string, actorUserId?: string): ProjectMember {
  const db = getDb();
  const project = db.projects.find((p) => p.id === projectId);
  if (!project) throw new Error('Proyecto no encontrado');

  const existing = db.projectMembers.find((m) => m.projectId === projectId && m.userId === userId);
  if (existing) {
    throw new Error('Este miembro ya está registrado en este proyecto');
  }

  const member: ProjectMember = {
    id: `pmem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    projectId,
    userId,
    responsibility,
    createdAt: new Date().toISOString(),
  };

  db.projectMembers.push(member);
  saveDb(db);

  const user = db.users.find((u) => u.id === userId);
  if (actorUserId) {
    logActivity('MEMBER_ADDED', `Incorporó a ${user?.fullName || 'miembro'} al equipo de "${project.title}"`, actorUserId, projectId);
  }

  return { ...member, user };
}

export function removeMemberFromProject(memberId: string, actorUserId?: string): void {
  const db = getDb();
  const mem = db.projectMembers.find((m) => m.id === memberId);
  if (!mem) throw new Error('Miembro no encontrado');

  db.projectMembers = db.projectMembers.filter((m) => m.id !== memberId);
  saveDb(db);

  if (actorUserId) {
    const user = db.users.find((u) => u.id === mem.userId);
    logActivity('MEMBER_REMOVED', `Retiró a ${user?.fullName || 'miembro'} del proyecto`, actorUserId, mem.projectId);
  }
}

// -------------------------------------------------------------
// TASKS CRUD & RULES
// -------------------------------------------------------------
export function getTasks(options?: {
  projectId?: string;
  assigneeId?: string;
  status?: TaskStatus;
  includeDeleted?: boolean;
  archived?: boolean;
}): Task[] {
  const db = getDb();
  let list = db.tasks;

  if (!options?.includeDeleted) {
    list = list.filter((t) => !t.deletedAt);
  } else {
    // Only deleted items for trash bin
    list = list.filter((t) => Boolean(t.deletedAt));
  }

  if (options?.projectId) {
    list = list.filter((t) => t.projectId === options.projectId);
  }

  if (options?.assigneeId) {
    list = list.filter((t) => t.assigneeId === options.assigneeId);
  }

  if (options?.status) {
    list = list.filter((t) => t.status === options.status);
  }

  if (options?.archived !== undefined) {
    list = list.filter((t) => t.archived === options.archived);
  }

  return list.map((t) => populateTask(t, db));
}

export function getTaskById(id: string, includeDeleted = false): Task | null {
  const db = getDb();
  const task = db.tasks.find((t) => t.id === id || t.code === id);
  if (!task) return null;
  if (!includeDeleted && task.deletedAt) return null;
  return populateTask(task, db);
}

function populateTask(t: Task, db: DatabaseSchema): Task {
  const assignee = db.users.find((u) => u.id === t.assigneeId);
  const project = db.projects.find((p) => p.id === t.projectId);
  const comments = db.comments.filter((c) => c.taskId === t.id);
  const isOverdue = isTaskOverdue(t);

  return {
    ...t,
    assignee,
    project: project ? { id: project.id, code: project.code, title: project.title } : undefined,
    comments,
    commentsCount: comments.length,
    isOverdue,
  };
}

export function createTask(
  data: Omit<Task, 'id' | 'code' | 'archived' | 'deletedAt' | 'createdAt' | 'updatedAt'>,
  actorUserId?: string
): Task {
  const db = getDb();
  const project = db.projects.find((p) => p.id === data.projectId);
  if (!project) throw new Error('El proyecto asociado no existe');

  const projectTasks = db.tasks.filter((t) => t.projectId === data.projectId);
  const taskNumber = projectTasks.length + 1;
  const projectNumStr = project.code.replace('PRJ-', '').replace('-', '');
  const code = `TSK-${projectNumStr.slice(-2)}${String(taskNumber).padStart(2, '0')}`;
  const now = new Date().toISOString();

  // Rule 6: Initial progress rules
  let progress = data.progress;
  if (data.status === 'CONCLUIDO') {
    progress = 100;
  } else if (data.status === 'PENDIENTE' && (progress === undefined || progress === null)) {
    progress = 0;
  }

  const newTask: Task = {
    id: `task-${Date.now()}`,
    code,
    projectId: data.projectId,
    title: data.title,
    description: data.description,
    startDate: data.startDate,
    dueDate: data.dueDate,
    assigneeId: data.assigneeId,
    progress: Math.min(100, Math.max(0, progress || 0)),
    status: data.status,
    priority: data.priority,
    archived: false,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  db.tasks.push(newTask);
  saveDb(db);

  if (actorUserId) {
    logActivity('TASK_CREATED', `Creó la tarea "${newTask.title}" (${newTask.code})`, actorUserId, data.projectId, newTask.id);
  }

  return populateTask(newTask, db);
}

export function updateTask(id: string, updates: Partial<Task>, actorUserId?: string): Task {
  const db = getDb();
  const index = db.tasks.findIndex((t) => t.id === id);
  if (index === -1) throw new Error('Tarea no encontrada');

  const prev = db.tasks[index];
  const now = new Date().toISOString();

  let newProgress = updates.progress !== undefined ? updates.progress : prev.progress;
  const newStatus = updates.status !== undefined ? updates.status : prev.status;

  // Rule 6: Automatismos de estado y avance
  // "Cuando una tarea se marque como concluida, establecer automáticamente su avance en 100 %."
  if (updates.status === 'CONCLUIDO' && prev.status !== 'CONCLUIDO') {
    newProgress = 100;
  }
  // "Cuando una tarea se marque como pendiente, establecer inicialmente su avance en 0 %."
  else if (updates.status === 'PENDIENTE' && prev.status !== 'PENDIENTE') {
    newProgress = 0;
  }

  // Ensure within 0-100 range
  newProgress = Math.min(100, Math.max(0, newProgress));

  db.tasks[index] = {
    ...prev,
    ...updates,
    progress: newProgress,
    status: newStatus,
    updatedAt: now,
  };

  saveDb(db);

  // Automatic activity audit log for important changes
  if (actorUserId) {
    if (updates.status && updates.status !== prev.status) {
      logActivity(
        'TASK_STATUS_CHANGED',
        `Cambió el estado de "${prev.title}" de ${prev.status} a ${updates.status} (Avance: ${newProgress}%)`,
        actorUserId,
        prev.projectId,
        prev.id
      );
    } else if (updates.progress !== undefined && updates.progress !== prev.progress) {
      logActivity(
        'TASK_PROGRESS_CHANGED',
        `Actualizó el avance de "${prev.title}" a ${newProgress}%`,
        actorUserId,
        prev.projectId,
        prev.id
      );
    } else {
      logActivity('TASK_UPDATED', `Modificó los datos de la tarea "${prev.title}"`, actorUserId, prev.projectId, prev.id);
    }
  }

  return populateTask(db.tasks[index], db);
}

export function duplicateTask(id: string, actorUserId?: string): Task {
  const db = getDb();
  const original = db.tasks.find((t) => t.id === id);
  if (!original) throw new Error('Tarea no encontrada');

  const projectTasks = db.tasks.filter((t) => t.projectId === original.projectId);
  const now = new Date().toISOString();
  const code = `TSK-${Date.now().toString().slice(-4)}`;

  const copy: Task = {
    ...original,
    id: `task-${Date.now()}`,
    code,
    title: `${original.title} (Copia)`,
    status: 'PENDIENTE',
    progress: 0,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  db.tasks.push(copy);
  saveDb(db);

  if (actorUserId) {
    logActivity('TASK_CREATED', `Duplicó la tarea "${original.title}"`, actorUserId, original.projectId, copy.id);
  }

  return populateTask(copy, db);
}

export function softDeleteTask(id: string, actorUserId?: string): void {
  const db = getDb();
  const task = db.tasks.find((t) => t.id === id);
  if (!task) throw new Error('Tarea no encontrada');

  task.deletedAt = new Date().toISOString();
  saveDb(db);

  if (actorUserId) {
    logActivity('TASK_DELETED', `Trasladó la tarea "${task.title}" a la papelera`, actorUserId, task.projectId, id);
  }
}

export function restoreTask(id: string, actorUserId?: string): void {
  const db = getDb();
  const task = db.tasks.find((t) => t.id === id);
  if (!task) throw new Error('Tarea no encontrada');

  task.deletedAt = null;
  saveDb(db);

  if (actorUserId) {
    logActivity('TASK_RESTORED', `Restauró la tarea "${task.title}" de la papelera`, actorUserId, task.projectId, id);
  }
}

export function hardDeleteTask(id: string): void {
  const db = getDb();
  db.tasks = db.tasks.filter((t) => t.id !== id);
  db.comments = db.comments.filter((c) => c.taskId !== id);
  saveDb(db);
}

// -------------------------------------------------------------
// COMMENTS
// -------------------------------------------------------------
export function getCommentsByTaskId(taskId: string): TaskComment[] {
  const db = getDb();
  return db.comments
    .filter((c) => c.taskId === taskId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function addComment(taskId: string, userId: string, content: string): TaskComment {
  const db = getDb();
  const task = db.tasks.find((t) => t.id === taskId);
  if (!task) throw new Error('Tarea no encontrada');

  const user = db.users.find((u) => u.id === userId);
  const now = new Date().toISOString();

  const comment: TaskComment = {
    id: `comm-${Date.now()}`,
    taskId,
    userId,
    authorName: user?.fullName || 'Usuario',
    authorEmail: user?.email || '',
    content,
    createdAt: now,
  };

  db.comments.push(comment);
  saveDb(db);

  logActivity('COMMENT_ADDED', `Añadió un comentario en la tarea "${task.title}"`, userId, task.projectId, taskId);

  return comment;
}

// -------------------------------------------------------------
// ACTIVITY LOGS
// -------------------------------------------------------------
export function getActivityLogs(options?: { projectId?: string; taskId?: string; limit?: number }): ActivityLog[] {
  const db = getDb();
  let list = db.activityLogs;

  if (options?.projectId) {
    list = list.filter((l) => l.projectId === options.projectId);
  }

  if (options?.taskId) {
    list = list.filter((l) => l.taskId === options.taskId);
  }

  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (options?.limit) {
    return list.slice(0, options.limit);
  }

  return list;
}

export function logActivity(
  actionType: ActivityLog['actionType'],
  description: string,
  userId: string,
  projectId?: string,
  taskId?: string,
  metadata?: Record<string, unknown>
): ActivityLog {
  const db = getDb();
  const user = db.users.find((u) => u.id === userId);

  const log: ActivityLog = {
    id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    projectId,
    taskId,
    userId,
    userName: user?.fullName || 'Sistema',
    actionType,
    description,
    metadata,
    createdAt: new Date().toISOString(),
  };

  db.activityLogs.unshift(log);
  // Keep last 500 logs to prevent file bloat
  if (db.activityLogs.length > 500) {
    db.activityLogs = db.activityLogs.slice(0, 500);
  }

  saveDb(db);
  return log;
}

// -------------------------------------------------------------
// NOTIFICATIONS
// -------------------------------------------------------------
export function getNotifications(userId?: string): NotificationItem[] {
  const db = getDb();
  let list = db.notifications;

  if (userId) {
    list = list.filter((n) => !n.userId || n.userId === userId);
  }

  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function markNotificationRead(id: string): void {
  const db = getDb();
  const notif = db.notifications.find((n) => n.id === id);
  if (notif) {
    notif.isRead = true;
    saveDb(db);
  }
}

export function createNotification(notif: Omit<NotificationItem, 'id' | 'createdAt'>): NotificationItem {
  const db = getDb();
  const newNotif: NotificationItem = {
    ...notif,
    id: `notif-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  db.notifications.unshift(newNotif);
  saveDb(db);
  return newNotif;
}

export function deleteNotification(id: string): void {
  const db = getDb();
  db.notifications = db.notifications.filter((n) => n.id !== id);
  saveDb(db);
}

export function clearNotifications(userId?: string): void {
  const db = getDb();
  if (userId) {
    db.notifications = db.notifications.filter((n) => n.userId && n.userId !== userId);
  } else {
    db.notifications = [];
  }
  saveDb(db);
}

// -------------------------------------------------------------
// SYSTEM STATS (DASHBOARD KPIs)
// -------------------------------------------------------------
export function getSystemStats(): SystemStats {
  const db = getDb();
  const projects = db.projects.filter((p) => !p.deletedAt);
  const tasks = db.tasks.filter((t) => !t.deletedAt);

  const activeProjects = projects.filter((p) => p.status === 'EN_PROGRESO' || p.status === 'PLANIFICACION');
  const completedProjects = projects.filter((p) => p.status === 'CONCLUIDO');
  const cancelledProjects = projects.filter((p) => p.status === 'CANCELADO');

  const pendingTasks = tasks.filter((t) => t.status === 'PENDIENTE');
  const inProgressTasks = tasks.filter((t) => t.status === 'EN_PROGRESO');
  const completedTasks = tasks.filter((t) => t.status === 'CONCLUIDO');
  const overdueTasks = tasks.filter((t) => isTaskOverdue(t));

  return {
    totalProjects: projects.length,
    activeProjects: activeProjects.length,
    completedProjects: completedProjects.length,
    cancelledProjects: cancelledProjects.length,
    pendingTasks: pendingTasks.length,
    inProgressTasks: inProgressTasks.length,
    completedTasks: completedTasks.length,
    overdueTasks: overdueTasks.length,
    totalTasks: tasks.length,
  };
}

// Helper to reset database to seed for fresh testing
export function resetDatabase(): void {
  saveDb(initialDatabase);
}
