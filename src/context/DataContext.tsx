'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Project, Task, User, ActivityLog, NotificationItem, SystemStats } from '@/lib/types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface DataContextType {
  projects: Project[];
  tasks: Task[];
  users: User[];
  activityLogs: ActivityLog[];
  notifications: NotificationItem[];
  stats: SystemStats | null;
  loading: boolean;
  refreshData: () => Promise<void>;

  // Projects
  createProject: (data: Partial<Project> & { assistantIds?: { userId: string; responsibility: string }[]; memberIds?: { userId: string; responsibility: string }[] }) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project> & { assistantIds?: { userId: string; responsibility: string }[] }) => Promise<Project>;
  deleteProject: (id: string, permanent?: boolean) => Promise<void>;
  restoreProject: (id: string) => Promise<void>;

  // Assistants & Members
  addAssistant: (projectId: string, userId: string, responsibility: string) => Promise<void>;
  removeAssistant: (projectId: string, assistantId: string) => Promise<void>;
  addMember: (projectId: string, userId: string, responsibility: string) => Promise<void>;
  removeMember: (projectId: string, memberId: string) => Promise<void>;

  // Tasks
  createTask: (data: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string, permanent?: boolean) => Promise<void>;
  restoreTask: (id: string) => Promise<void>;
  duplicateTask: (id: string) => Promise<Task>;

  // Comments & Users
  addComment: (taskId: string, content: string) => Promise<void>;
  createUser: (data: Partial<User>) => Promise<User>;
  updateUser: (id: string, updates: Partial<User>) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  resetDatabase: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, syncUsers } = useAuth();
  const { toast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshData = useCallback(async () => {
    try {
      const [projRes, tasksRes, usersRes, actRes, notifRes, statsRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/tasks'),
        fetch('/api/users'),
        fetch('/api/activity?limit=30'),
        fetch('/api/notifications'),
        fetch('/api/stats'),
      ]);

      const [projData, tasksData, usersData, actData, notifData, statsData] = await Promise.all([
        projRes.json(),
        tasksRes.json(),
        usersRes.json(),
        actRes.json(),
        notifRes.json(),
        statsRes.json(),
      ]);

      if (projData.success) setProjects(projData.data);
      if (tasksData.success) setTasks(tasksData.data);
      if (usersData.success) {
        setUsers(usersData.data);
        syncUsers(usersData.data);
      }
      if (actData.success) setActivityLogs(actData.data);
      if (notifData.success) setNotifications(notifData.data);
      if (statsData.success) setStats(statsData.data);
    } catch (error) {
      console.error('Error cargando datos del sistema:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Headers with active user id for server audit log
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'x-user-id': currentUser?.id || '',
  });

  // Projects
  const createProject = async (data: Partial<Project> & { assistantIds?: { userId: string; responsibility: string }[]; memberIds?: { userId: string; responsibility: string }[] }) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!result.success) {
      toast.error(result.error || 'No se pudo crear el proyecto');
      throw new Error(result.error);
    }
    toast.success(`Proyecto "${result.data.title}" creado exitosamente`);
    await refreshData();
    return result.data;
  };

  const updateProject = async (id: string, updates: Partial<Project> & { assistantIds?: { userId: string; responsibility: string }[] }) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    const result = await res.json();
    if (!result.success) {
      toast.error(result.error || 'Error al actualizar proyecto');
      throw new Error(result.error);
    }
    toast.success('Proyecto actualizado correctamente');
    await refreshData();
    return result.data;
  };

  const deleteProject = async (id: string, permanent = false) => {
    const res = await fetch(`/api/projects/${id}${permanent ? '?permanent=true' : ''}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const result = await res.json();
    if (!result.success) {
      toast.error(result.error || 'Error al eliminar proyecto');
      throw new Error(result.error);
    }
    toast.success(result.message || 'Proyecto eliminado');
    await refreshData();
  };

  const restoreProject = async (id: string) => {
    const res = await fetch(`/api/projects/${id}/restore`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const result = await res.json();
    if (!result.success) {
      toast.error(result.error || 'Error al restaurar proyecto');
      throw new Error(result.error);
    }
    toast.success('Proyecto restaurado de la papelera');
    await refreshData();
  };

  // Assistants & Members
  const addAssistant = async (projectId: string, userId: string, responsibility: string) => {
    const res = await fetch(`/api/projects/${projectId}/assistants`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId, responsibility }),
    });
    const result = await res.json();
    if (!result.success) {
      toast.error(result.error || 'Error al añadir asistente');
      throw new Error(result.error);
    }
    toast.success('Asistente añadido al proyecto');
    await refreshData();
  };

  const removeAssistant = async (projectId: string, assistantId: string) => {
    const res = await fetch(`/api/projects/${projectId}/assistants?assistantId=${assistantId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const result = await res.json();
    if (!result.success) {
      toast.error(result.error || 'Error al remover asistente');
      throw new Error(result.error);
    }
    toast.success('Asistente retirado del proyecto');
    await refreshData();
  };

  const addMember = async (projectId: string, userId: string, responsibility: string) => {
    const res = await fetch(`/api/projects/${projectId}/members`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId, responsibility }),
    });
    const result = await res.json();
    if (!result.success) {
      toast.error(result.error || 'Error al registrar miembro');
      throw new Error(result.error);
    }
    toast.success('Miembro incorporado al equipo');
    await refreshData();
  };

  const removeMember = async (projectId: string, memberId: string) => {
    const res = await fetch(`/api/projects/${projectId}/members?memberId=${memberId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const result = await res.json();
    if (!result.success) {
      toast.error(result.error || 'Error al retirar miembro');
      throw new Error(result.error);
    }
    toast.success('Miembro retirado del proyecto');
    await refreshData();
  };

  // Tasks
  const createTask = async (data: Partial<Task>) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!result.success) {
      toast.error(result.error || 'Error al crear tarea');
      throw new Error(result.error);
    }
    toast.success(`Tarea "${result.data.title}" registrada`);
    await refreshData();
    return result.data;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    const result = await res.json();
    if (!result.success) {
      toast.error(result.error || 'Error al actualizar tarea');
      throw new Error(result.error);
    }
    toast.success('Tarea actualizada');
    await refreshData();
    return result.data;
  };

  const deleteTask = async (id: string, permanent = false) => {
    const res = await fetch(`/api/tasks/${id}${permanent ? '?permanent=true' : ''}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const result = await res.json();
    if (!result.success) {
      toast.error(result.error || 'Error al eliminar tarea');
      throw new Error(result.error);
    }
    toast.success(result.message || 'Tarea eliminada');
    await refreshData();
  };

  const restoreTask = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}/restore`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const result = await res.json();
    if (!result.success) {
      toast.error(result.error || 'Error al restaurar tarea');
      throw new Error(result.error);
    }
    toast.success('Tarea restaurada');
    await refreshData();
  };

  const duplicateTask = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}/duplicate`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const result = await res.json();
    if (!result.success) {
      toast.error(result.error || 'Error al duplicar tarea');
      throw new Error(result.error);
    }
    toast.success('Tarea duplicada correctamente');
    await refreshData();
    return result.data;
  };

  // Comments
  const addComment = async (taskId: string, content: string) => {
    const res = await fetch(`/api/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId: currentUser.id, content }),
    });
    const result = await res.json();
    if (!result.success) {
      toast.error(result.error || 'Error al registrar comentario');
      throw new Error(result.error);
    }
    toast.success('Comentario registrado');
    await refreshData();
  };

  // Users
  const createUser = async (data: Partial<User>) => {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!result.success) {
      toast.error(result.error || 'Error al registrar usuario');
      throw new Error(result.error);
    }
    toast.success(`Usuario ${result.data.fullName} creado`);
    await refreshData();
    return result.data;
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    const res = await fetch('/api/users', {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ id, ...updates }),
    });
    const result = await res.json();
    if (!result.success) {
      toast.error(result.error || 'Error al actualizar usuario');
      throw new Error(result.error);
    }
    toast.success(`Datos de ${result.data.fullName} actualizados`);
    await refreshData();
    return result.data;
  };

  const deleteUser = async (id: string) => {
    const res = await fetch(`/api/users?id=${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const result = await res.json();
    if (!result.success) {
      toast.error(result.error || 'Error al eliminar usuario');
      throw new Error(result.error);
    }
    toast.success('Miembro eliminado del directorio exitosamente');
    await refreshData();
  };

  // Notifications
  const markNotificationRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ id }),
    });
    await refreshData();
  };

  const deleteNotification = async (id: string) => {
    const res = await fetch(`/api/notifications?id=${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const result = await res.json();
    if (!result.success) {
      toast.error(result.error || 'Error al eliminar notificación');
      throw new Error(result.error);
    }
    toast.success('Notificación eliminada');
    await refreshData();
  };

  const clearAllNotifications = async () => {
    const res = await fetch('/api/notifications?all=true', {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const result = await res.json();
    if (!result.success) {
      toast.error(result.error || 'Error al borrar notificaciones');
      throw new Error(result.error);
    }
    toast.success('Todas las notificaciones han sido eliminadas');
    await refreshData();
  };

  // Reset database
  const resetDatabase = async () => {
    const res = await fetch('/api/db/reset', {
      method: 'POST',
      headers: getHeaders(),
    });
    const result = await res.json();
    if (result.success) {
      toast.info('Base de datos restablecida a los datos demostrativos');
      await refreshData();
    }
  };

  return (
    <DataContext.Provider
      value={{
        projects,
        tasks,
        users,
        activityLogs,
        notifications,
        stats,
        loading,
        refreshData,
        createProject,
        updateProject,
        deleteProject,
        restoreProject,
        addAssistant,
        removeAssistant,
        addMember,
        removeMember,
        createTask,
        updateTask,
        deleteTask,
        restoreTask,
        duplicateTask,
        addComment,
        createUser,
        updateUser,
        deleteUser,
        markNotificationRead,
        deleteNotification,
        clearAllNotifications,
        resetDatabase,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
