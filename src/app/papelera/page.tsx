'use client';

import React, { useState } from 'react';
import { Trash2, RotateCcw, AlertTriangle, CheckSquare, FolderKanban } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Task, Project } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { ConfirmModal } from '@/components/common/ConfirmModal';

export default function PapeleraPage() {
  const { tasks, projects, restoreTask, deleteTask, restoreProject, deleteProject } = useData();
  const { isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'tasks' | 'projects'>('tasks');
  const [taskToPurge, setTaskToPurge] = useState<Task | null>(null);
  const [projectToPurge, setProjectToPurge] = useState<Project | null>(null);

  // Soft-deleted items
  const deletedTasks = tasks.filter((t) => Boolean(t.deletedAt));
  const deletedProjects = projects.filter((p) => Boolean(p.deletedAt));

  const handleRestoreTask = async (id: string) => {
    try {
      await restoreTask(id);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePurgeTask = async () => {
    if (!taskToPurge) return;
    try {
      await deleteTask(taskToPurge.id, true); // permanent = true
      setTaskToPurge(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRestoreProject = async (id: string) => {
    try {
      await restoreProject(id);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePurgeProject = async () => {
    if (!projectToPurge) return;
    try {
      await deleteProject(projectToPurge.id, true); // permanent = true
      setProjectToPurge(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <Trash2 className="w-7 h-7 text-rose-500" />
          Papelera de Recuperación
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Los elementos eliminados se conservan aquí para permitir su restauración inmediata o su eliminación definitiva del sistema.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'tasks'
              ? 'border-rose-500 text-rose-600 dark:text-rose-400 dark:border-rose-500'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Tareas en Papelera ({deletedTasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'projects'
              ? 'border-rose-500 text-rose-600 dark:text-rose-400 dark:border-rose-500'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>Proyectos en Papelera ({deletedProjects.length})</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'tasks' ? (
        <div className="space-y-3">
          {deletedTasks.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <CheckSquare className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                La papelera de tareas está vacía
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                No hay tareas pendientes de recuperación.
              </p>
            </div>
          ) : (
            deletedTasks.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {t.code}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 line-through opacity-80">
                      {t.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    Proyecto: {t.project?.title || 'N/A'} • Eliminada el: {formatDate(t.deletedAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleRestoreTask(t.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition-all border border-indigo-200 dark:border-indigo-800"
                    title="Restaurar tarea"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => setTaskToPurge(t)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition-colors"
                      title="Eliminar definitivamente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {deletedProjects.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <FolderKanban className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                La papelera de proyectos está vacía
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                No hay proyectos pendientes de recuperación.
              </p>
            </div>
          ) : (
            deletedProjects.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {p.code}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 line-through opacity-80">
                      {p.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    PM: {p.manager?.fullName || 'N/A'} • Eliminado el: {formatDate(p.deletedAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleRestoreProject(p.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition-all border border-indigo-200 dark:border-indigo-800"
                    title="Restaurar proyecto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => setProjectToPurge(p)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition-colors"
                      title="Eliminar definitivamente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Confirmation Modal before Permanent Purge */}
      <ConfirmModal
        isOpen={Boolean(taskToPurge)}
        title="¿Eliminar definitivamente la tarea?"
        message={`Esta acción destruirá permanentemente la tarea "${taskToPurge?.title}" (${taskToPurge?.code}) y no podrá ser recuperada.`}
        confirmText="Eliminar Permanentemente"
        cancelText="Conservar en Papelera"
        onConfirm={handlePurgeTask}
        onCancel={() => setTaskToPurge(null)}
      />

      <ConfirmModal
        isOpen={Boolean(projectToPurge)}
        title="¿Eliminar definitivamente el proyecto?"
        message={`Esta acción destruirá permanentemente el proyecto "${projectToPurge?.title}" (${projectToPurge?.code}) y todas sus tareas asociadas. Esta acción no se puede deshacer.`}
        confirmText="Eliminar Permanentemente"
        cancelText="Conservar en Papelera"
        onConfirm={handlePurgeProject}
        onCancel={() => setProjectToPurge(null)}
      />
    </div>
  );
}
