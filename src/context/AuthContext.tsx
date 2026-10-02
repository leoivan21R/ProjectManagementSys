'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Project, Task } from '@/lib/types';

const defaultGuestUser: User = {
  id: 'guest',
  fullName: 'Leo I. Rivera',
  email: 'leo.rivera@amlconsultant.com',
  role: 'ADMIN',
  jobTitle: 'Project Manager & Admin',
  department: 'Consultor Externo',
  avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Leo%20Rivera',
  createdAt: new Date().toISOString(),
};

interface AuthContextType {
  currentUser: User;
  allUsers: User[];
  setCurrentUser: (user: User) => void;
  switchUserById: (userId: string) => void;
  syncUsers: (users: User[]) => void;
  isAdmin: boolean;
  isProjectManager: boolean;
  isTeamMember: boolean;
  canCreateProject: boolean;
  canDeleteProject: boolean;
  canManageProject: (project?: Project | null) => boolean;
  canEditTask: (task?: Task | null) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User>(defaultGuestUser);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Load real users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setAllUsers(json.data);
          const savedUserId = typeof window !== 'undefined' ? localStorage.getItem('pms_active_user_id') : null;
          const found = json.data.find((u: User) => u.id === savedUserId);
          if (found) {
            setCurrentUserState(found);
          } else {
            // Pick an ADMIN or PROJECT_MANAGER if available, otherwise first user
            const adminOrPm = json.data.find((u: User) => u.role === 'ADMIN' || u.role === 'PROJECT_MANAGER');
            setCurrentUserState(adminOrPm || json.data[0]);
          }
        } else if (json.success && json.data.length === 0) {
          setAllUsers([]);
          setCurrentUserState(defaultGuestUser);
        }
      } catch (err) {
        console.error('Error cargando usuarios en AuthContext:', err);
      }
    };
    fetchUsers();
  }, []);

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pms_active_user_id', user.id);
    }
  };

  const switchUserById = (userId: string) => {
    const user = allUsers.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  // Synchronize users whenever DataContext refreshes (create, update, delete)
  const syncUsers = useCallback((newUsers: User[]) => {
    if (!newUsers || newUsers.length === 0) {
      setAllUsers([]);
      setCurrentUserState(defaultGuestUser);
      return;
    }

    setAllUsers(newUsers);

    setCurrentUserState((prev) => {
      // If active user was edited, update properties (e.g. role change)
      const updated = newUsers.find((u) => u.id === prev.id);
      if (updated) {
        return updated;
      }
      // If previous user was deleted, fallback to saved id or first available
      const savedUserId = typeof window !== 'undefined' ? localStorage.getItem('pms_active_user_id') : null;
      const foundSaved = newUsers.find((u) => u.id === savedUserId);
      if (foundSaved) {
        return foundSaved;
      }
      const adminOrPm = newUsers.find((u) => u.role === 'ADMIN' || u.role === 'PROJECT_MANAGER');
      return adminOrPm || newUsers[0];
    });
  }, []);

  const isAdmin = currentUser ? currentUser.role === 'ADMIN' : true;
  const isProjectManager = currentUser ? (currentUser.role === 'PROJECT_MANAGER' || isAdmin) : true;
  const isTeamMember = currentUser ? currentUser.role === 'TEAM_MEMBER' : false;

  // Rule 11: Permissions
  // Admin: Administrar usuarios, Crear y eliminar proyectos, Consultar todos los proyectos, Administrar permisos, Generar reportes generales
  // Project Manager: Administrar sus proyectos, Incorporar asistentes, Administrar miembros, Asignar tareas, Actualizar proyectos, Consultar reportes
  // Miembro del equipo: Consultar los proyectos autorizados, Visualizar sus tareas, Actualizar sus tareas según los permisos asignados, Añadir comentarios
  const canCreateProject = isAdmin || (currentUser ? currentUser.role === 'PROJECT_MANAGER' : true);
  const canDeleteProject = isAdmin;

  const canManageProject = (project?: Project | null) => {
    if (!project) return false;
    if (isAdmin) return true;
    if (project.managerId === currentUser.id) return true;
    const isAssistant = project.assistants?.some((a) => a.userId === currentUser.id);
    return Boolean(isAssistant);
  };

  const canEditTask = (task?: Task | null) => {
    if (!task) return false;
    if (isAdmin) return true;
    if (currentUser.role === 'PROJECT_MANAGER') return true;
    // Team members can update tasks assigned to them
    return task.assigneeId === currentUser.id;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        setCurrentUser,
        switchUserById,
        syncUsers,
        isAdmin,
        isProjectManager,
        isTeamMember,
        canCreateProject,
        canDeleteProject,
        canManageProject,
        canEditTask,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
