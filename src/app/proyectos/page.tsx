'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  Plus,
  Search,
  Calendar,
  Eye,
  Edit2,
  Trash2,
  Archive,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Project, ProjectStatus, ProjectPriority } from '@/lib/types';
import { formatDate, getProjectStatusConfig, getPriorityConfig } from '@/lib/utils';
import { ProgressBar } from '@/components/common/ProgressBar';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { ProjectModal } from '@/components/projects/ProjectModal';
import Image from 'next/image';

export default function ProyectosPage() {
  const { projects, deleteProject, updateProject } = useData();
  const { canCreateProject, canDeleteProject } = useAuth();
  const { t } = useLanguage();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [priorityFilter, setPriorityFilter] = useState<string>('TODAS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Exclude soft-deleted
  const activeProjects = projects.filter((p) => !p.deletedAt);

  const filtered = activeProjects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.summary.toLowerCase().includes(search.toLowerCase()) ||
      (p.manager?.fullName || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter !== 'TODOS' && p.status !== statusFilter) return false;
    if (priorityFilter !== 'TODAS' && p.priority !== priorityFilter) return false;

    return true;
  });

  const handleArchive = async (project: Project) => {
    try {
      await updateProject(project.id, { archived: !project.archived });
    } catch (e) {
      console.error(e);
    }
  };

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
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FolderKanban className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            {t('projects.catalog_title', 'Catálogo de Proyectos')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('projects.catalog_sub', 'Administra todos los proyectos, designa responsables, supervisa cronogramas y avances generales.')}
          </p>
        </div>

        {canCreateProject && (
          <button
            onClick={() => {
              setProjectToEdit(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{t('action.new_project', 'Nuevo Proyecto')}</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('projects.search_placeholder', 'Buscar por código, título, resumen o Project Manager...')}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            <option value="TODOS">{t('projects.all_statuses', 'Todos los Estados')}</option>
            <option value="PLANIFICACION">{t('status.PLANIFICACION', 'Planificación')}</option>
            <option value="EN_PROGRESO">{t('status.EN_PROGRESO', 'En Progreso')}</option>
            <option value="EN_PAUSA">{t('status.EN_PAUSA', 'En Pausa')}</option>
            <option value="CONCLUIDO">{t('status.CONCLUIDO', 'Concluido')}</option>
            <option value="CANCELADO">{t('status.CANCELADO', 'Cancelado')}</option>
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            <option value="TODAS">{t('projects.all_priorities', 'Todas las Prioridades')}</option>
            <option value="CRITICA">{t('priority.CRITICA', 'Crítica')}</option>
            <option value="ALTA">{t('priority.ALTA', 'Alta')}</option>
            <option value="MEDIA">{t('priority.MEDIA', 'Media')}</option>
            <option value="BAJA">{t('priority.BAJA', 'Baja')}</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <FolderKanban className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            {t('projects.empty_search', 'No se encontraron proyectos')}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {t('projects.empty_search', 'Prueba ajustando los filtros o añade un nuevo proyecto con el botón superior.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => {
            const statusCfg = getProjectStatusConfig(project.status, t);
            const priorityCfg = getPriorityConfig(project.priority, t);

            return (
              <div
                key={project.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col overflow-hidden group"
              >
                {/* Card Top */}
                <div className="p-5 flex-1 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                      {project.code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${statusCfg.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        {statusCfg.label}
                      </span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${priorityCfg.badge}`}>
                        {priorityCfg.label}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Link
                      href={`/proyectos/${project.id}`}
                      className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1"
                    >
                      {project.title}
                    </Link>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {project.summary}
                    </p>
                  </div>

                  {/* Project Manager & Assistants */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-2">
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
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {project.manager?.fullName || t('projects.no_pm', 'Sin PM Asignado')}
                        </p>
                        <p className="text-[10px] text-slate-400">{t('role.PROJECT_MANAGER', 'Project Manager')}</p>
                      </div>
                    </div>

                    {project.assistants && project.assistants.length > 0 && (
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        <span className="font-semibold text-slate-600 dark:text-slate-400">{t('dir.assistants_title', 'Asistentes')}:</span>{' '}
                        {project.assistants.map((a) => a.user?.fullName).join(', ')}
                      </p>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(project.startDate)}</span>
                    </div>
                    <span>→</span>
                    <div className="font-semibold text-slate-700 dark:text-slate-300">
                      {formatDate(project.targetDate)}
                    </div>
                  </div>

                  {/* Progress (Rule 9) */}
                  <div className="pt-2">
                    <div className="flex justify-between items-center text-xs font-semibold mb-1">
                      <span className="text-slate-500">{t('projects.gen_progress', 'Progreso general')}</span>
                      <span className="font-mono text-slate-900 dark:text-white">
                        {project.calculatedProgress !== null ? `${project.calculatedProgress}%` : t('charts.no_tasks', 'Sin datos')}
                      </span>
                    </div>
                    <ProgressBar progress={project.calculatedProgress} size="md" />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>{project.tasksCount || 0} {t('charts.tasks', 'tareas')}</span>
                      <span>{project.completedTasksCount || 0} {t('status.CONCLUIDO', 'concluidas')}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3 bg-slate-50/70 dark:bg-slate-950/70 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <Link
                    href={`/proyectos/${project.id}`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <span>{t('projects.view_detail', 'Abrir Proyecto')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleArchive(project)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
                      title={project.archived ? t('projects.unarchive_action', 'Desarchivar') : t('projects.archive_action', 'Archivar')}
                    >
                      <Archive className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setProjectToEdit(project);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
                      title={t('projects.edit', 'Editar')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {canDeleteProject && (
                      <button
                        onClick={() => setProjectToDelete(project)}
                        className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg transition-colors"
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

      {/* Modals */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setProjectToEdit(null);
        }}
        projectToEdit={projectToEdit}
      />

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
