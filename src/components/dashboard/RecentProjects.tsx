'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Calendar, ArrowRight, Eye, Edit2, Trash2 } from 'lucide-react';
import { Project } from '@/lib/types';
import { formatDate, getProjectStatusConfig, getPriorityConfig } from '@/lib/utils';
import { ProgressBar } from '@/components/common/ProgressBar';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Image from 'next/image';

interface RecentProjectsProps {
  onOpenNewProject: () => void;
  onEditProject: (project: Project) => void;
}

export function RecentProjects({ onOpenNewProject, onEditProject }: RecentProjectsProps) {
  const { projects, deleteProject } = useData();
  const { canCreateProject, canDeleteProject } = useAuth();
  const { t } = useLanguage();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'ACTIVOS' | 'CONCLUIDOS' | 'CANCELADOS'>('TODOS');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Active projects list (excluding soft-deleted)
  const activeProjects = projects.filter((p) => !p.deletedAt);

  // Filter logic
  const filtered = activeProjects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      (p.manager?.fullName || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'ACTIVOS') return p.status === 'EN_PROGRESO' || p.status === 'PLANIFICACION';
    if (statusFilter === 'CONCLUIDOS') return p.status === 'CONCLUIDO';
    if (statusFilter === 'CANCELADOS') return p.status === 'CANCELADO';
    return true;
  });

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      await deleteProject(projectToDelete.id);
      setProjectToDelete(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {t('projects.recent_title', 'Proyectos en Ejecución y Seguimiento')}
          </h3>
          <p className="text-xs text-slate-500">
            {t('projects.recent_sub', 'Supervisión integral de fechas, responsables y porcentaje de avance.')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canCreateProject && (
            <button
              onClick={onOpenNewProject}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{t('action.new_project', 'Nuevo Proyecto')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('projects.search_placeholder', 'Buscar por título, código o Project Manager...')}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(['TODOS', 'ACTIVOS', 'CONCLUIDOS', 'CANCELADOS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab === 'TODOS'
                ? t('projects.tab_all', 'Todos')
                : tab === 'ACTIVOS'
                ? t('projects.tab_active', 'Activos')
                : tab === 'CONCLUIDOS'
                ? t('projects.tab_completed', 'Concluidos')
                : t('projects.tab_cancelled', 'Cancelados')}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Table / Cards */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          {t('projects.empty_search', 'No se encontraron proyectos con los criterios de búsqueda actuales.')}
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {filtered.map((project) => {
            const statusCfg = getProjectStatusConfig(project.status, t);
            const priorityCfg = getPriorityConfig(project.priority, t);

            return (
              <div
                key={project.id}
                className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 -mx-2 px-2 rounded-xl transition-colors"
              >
                {/* Project Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                      {project.code}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${statusCfg.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      {statusCfg.label}
                    </span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${priorityCfg.badge}`}>
                      {priorityCfg.label}
                    </span>
                  </div>

                  <Link
                    href={`/proyectos/${project.id}`}
                    className="text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1"
                  >
                    {project.title}
                  </Link>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {project.summary}
                  </p>
                </div>

                {/* PM & Dates & Progress */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 lg:gap-6">
                  {/* Project Manager */}
                  <div className="flex items-center gap-2 min-w-[130px]">
                    {project.manager?.avatarUrl && (
                      <Image
                        src={project.manager.avatarUrl}
                        alt={project.manager.fullName}
                        width={28}
                        height={28}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        unoptimized
                      />
                    )}
                    <div>
                      <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                        {project.manager?.fullName || t('projects.no_pm', 'Sin PM')}
                      </p>
                      <p className="text-[10px] text-slate-400">Project Manager</p>
                    </div>
                  </div>

                  {/* Estimated Finish Date */}
                  <div className="min-w-[110px]">
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(project.targetDate)}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">{t('projects.est_end', 'Fecha estimada fin')}</p>
                  </div>

                  {/* Visual Progress Bar (Step 9) */}
                  <div className="w-36">
                    <div className="flex justify-between items-center text-[11px] font-semibold mb-1">
                      <span className="text-slate-500">{t('projects.gen_progress', 'Progreso general')}</span>
                      <span className="text-slate-900 dark:text-white font-mono">
                        {project.calculatedProgress !== null ? `${project.calculatedProgress}%` : 'S/P'}
                      </span>
                    </div>
                    <ProgressBar progress={project.calculatedProgress} size="md" />
                    <p className="text-[10px] text-slate-400 mt-1">
                      {project.tasksCount || 0} {t('projects.tasks_completed_count', 'tareas ({count} concluidas)').replace('{count}', String(project.completedTasksCount || 0))}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/proyectos/${project.id}`}
                      className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-xl transition-colors"
                      title={t('projects.view_detail', 'Ver detalle del proyecto')}
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => onEditProject(project)}
                      className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      title={t('projects.edit', 'Editar proyecto')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {canDeleteProject && (
                      <button
                        onClick={() => setProjectToDelete(project)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition-colors"
                        title={t('projects.move_to_trash', 'Mover a papelera')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal before Deleting */}
      <ConfirmModal
        isOpen={Boolean(projectToDelete)}
        title={t('projects.delete_modal_title', '¿Mover proyecto a la papelera?')}
        message={t('projects.delete_modal_msg', '¿Estás seguro de que deseas eliminar el proyecto "{title}" ({code})? Se trasladará a la papelera de recuperación.')
          .replace('{title}', projectToDelete?.title || '')
          .replace('{code}', projectToDelete?.code || '')}
        confirmText={t('projects.move_trash_btn', 'Mover a Papelera')}
        cancelText={t('projects.keep_btn', 'Conservar Proyecto')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setProjectToDelete(null)}
      />
    </div>
  );
}
