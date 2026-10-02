'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  CheckSquare,
  Compass,
  Users,
  History,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Target,
  UserPlus,
  Mail,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Task, Project } from '@/lib/types';
import { formatDate, formatDateTime, getProjectStatusConfig, getPriorityConfig } from '@/lib/utils';
import { ProgressBar } from '@/components/common/ProgressBar';
import { TaskTable } from '@/components/tasks/TaskTable';
import { TaskModal } from '@/components/tasks/TaskModal';
import { ProjectModal } from '@/components/projects/ProjectModal';
import { ProjectDirectionCard } from '@/components/projects/ProjectDirectionCard';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import Image from 'next/image';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { projects, tasks, users, activityLogs, addMember, removeMember, deleteProject } = useData();
  const { canManageProject, canDeleteProject } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'tasks' | 'direction' | 'team' | 'activity'>('tasks');
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(false);

  // New member modal in project
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberUserId, setNewMemberUserId] = useState('');
  const [newMemberResp, setNewMemberResp] = useState('');
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; user?: { fullName: string } } | null>(null);

  const project = projects.find((p) => p.id === id || p.code === id);

  if (!project) {
    return (
      <div className="py-20 text-center space-y-4">
        <FolderKanban className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          {t('projects.empty_search', 'Proyecto no encontrado o eliminado')}
        </h2>
        <p className="text-xs text-slate-400">
          {t('projects.empty_search', 'El identificador solicitado no coincide con ningún proyecto activo.')}
        </p>
        <Link
          href="/proyectos"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> {t('pdetail.back', 'Volver al catálogo')}
        </Link>
      </div>
    );
  }

  const projectTasks = tasks.filter((t) => t.projectId === project.id && !t.deletedAt);
  const projectLogs = activityLogs.filter((l) => l.projectId === project.id);
  const statusCfg = getProjectStatusConfig(project.status, t);
  const priorityCfg = getPriorityConfig(project.priority, t);
  const editable = canManageProject(project);

  const handleOpenNewTask = () => {
    setTaskToEdit(null);
    setTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setTaskModalOpen(true);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberUserId || !newMemberResp.trim()) return;
    try {
      await addMember(project.id, newMemberUserId, newMemberResp.trim());
      setIsAddingMember(false);
      setNewMemberResp('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (confirm(t('dir.confirm_remove', '¿Retirar a este miembro del proyecto?'))) {
      await removeMember(project.id, memberId);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/proyectos" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('nav.projects', 'Proyectos')}</span>
        </Link>
        <span>/</span>
        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{project.code}</span>
      </div>

      {/* Project Hero Header Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                {project.code}
              </span>
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-md border ${statusCfg.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                {statusCfg.label}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${priorityCfg.badge}`}>
                {priorityCfg.label}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {project.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
              {project.summary}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {editable && (
              <button
                onClick={() => setProjectModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{t('projects.edit', 'Editar Proyecto')}</span>
              </button>
            )}

            {canDeleteProject && (
              <button
                onClick={() => setConfirmDeleteProject(true)}
                className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                title={t('projects.move_to_trash', 'Mover a papelera')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Objectives */}
        {project.objectives && project.objectives.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              {t('pdetail.objectives', 'Objetivos Principales del Proyecto')}
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
              {project.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-indigo-500 font-bold">•</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Project Metrics & Timeline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t('role.PROJECT_MANAGER', 'Project Manager')}</p>
            <div className="flex items-center gap-2 mt-1.5">
              {project.manager?.avatarUrl && (
                <Image
                  src={project.manager.avatarUrl}
                  alt={project.manager.fullName}
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full object-cover"
                  unoptimized
                />
              )}
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {project.manager?.fullName || t('projects.no_pm', 'Sin Asignar')}
              </span>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t('pdetail.dates_info', 'Vigencia y Cronograma')}</p>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDate(project.startDate)} → {formatDate(project.targetDate)}</span>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{t('dir.assistants_title', 'Asistentes Designados')}</p>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1.5">
              {project.assistants?.length || 0} {t('dir.assistants_title', 'coordinadores')}
            </p>
          </div>

          {/* Overall Progress Calculation (Step 9) */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
              <span>{t('projects.gen_progress', 'Progreso General')}</span>
              <span className="text-slate-900 dark:text-white font-mono font-bold">
                {project.calculatedProgress !== null ? `${project.calculatedProgress}%` : t('charts.no_tasks', 'Sin tareas activas')}
              </span>
            </div>
            <ProgressBar progress={project.calculatedProgress} size="md" />
            <p className="text-[10px] text-slate-400 mt-1">
              {project.tasksCount || 0} {t('charts.tasks', 'tareas')}
            </p>
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 sm:space-x-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'tasks'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>{t('pdetail.tab_tasks', 'Tareas del Proyecto')} ({projectTasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('direction')}
          className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'direction'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>{t('pdetail.tab_direction', 'Dirección y Coordinación')}</span>
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'team'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t('pdetail.tab_team', 'Equipo Asignado')} ({project.members?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'activity'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>{t('pdetail.tab_activity', 'Registro de Actividad')} ({projectLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {t('tasks.sub', 'Tabla interactiva con avance, fechas, responsables y automatismos de estado.')}
            </p>
            {editable && (
              <button
                onClick={handleOpenNewTask}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{t('action.add_task', 'Añadir Tarea')}</span>
              </button>
            )}
          </div>

          <TaskTable tasks={projectTasks} onEditTask={handleEditTask} />
        </div>
      )}

      {/* Tab 2: Direction & Coordination */}
      {activeTab === 'direction' && (
        <ProjectDirectionCard project={project} />
      )}

      {/* Tab 3: Team */}
      {activeTab === 'team' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('pdetail.tab_team', 'Integrantes del Equipo')}: &ldquo;{project.title}&rdquo;
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('teams.subtitle', 'Colaboradores asignados al desarrollo operativo de este proyecto.')}
              </p>
            </div>

            {editable && !isAddingMember && (
              <button
                onClick={() => {
                  setNewMemberUserId(users[0]?.id || '');
                  setIsAddingMember(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition-all border border-indigo-200 dark:border-indigo-800"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t('action.add_member', 'Incorporar Miembro')}</span>
              </button>
            )}
          </div>

          {/* Add member form */}
          {isAddingMember && (
            <form onSubmit={handleAddMember} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-indigo-300 dark:border-indigo-800 space-y-3">
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {t('action.add_member', 'Incorporar miembro existente del directorio al proyecto')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {t('teams.all_profiles', 'Seleccionar Miembro:')}
                  </label>
                  <select
                    value={newMemberUserId}
                    onChange={(e) => setNewMemberUserId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.jobTitle})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {t('dir.resp_label', 'Responsabilidad en este proyecto:')}
                  </label>
                  <input
                    type="text"
                    required
                    value={newMemberResp}
                    onChange={(e) => setNewMemberResp(e.target.value)}
                    placeholder={t('dir.resp_placeholder', 'Ej: Desarrollo Frontend de Componentes')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingMember(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:text-slate-900"
                >
                  {t('action.cancel', 'Cancelar')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                >
                  {t('action.add_member', 'Incorporar')}
                </button>
              </div>
            </form>
          )}

          {/* Members list */}
          {!project.members || project.members.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              {t('teams.all_profiles', 'No hay miembros asignados directamente a este equipo todavía.')}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.members.map((mem) => {
                const memberTasks = projectTasks.filter((t) => t.assigneeId === mem.userId);
                return (
                  <div
                    key={mem.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-3 shadow-xs hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="flex items-start gap-3">
                        {mem.user?.avatarUrl && (
                          <Image
                            src={mem.user.avatarUrl}
                            alt={mem.user.fullName}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                            unoptimized
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {mem.user?.fullName}
                          </h5>
                          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium truncate mt-0.5">
                            {mem.responsibility}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{mem.user?.email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{memberTasks.length}</span> {t('teams.tasks_label', 'tareas asignadas')}
                      </div>
                    </div>

                    {editable && (
                      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t('teams.member_management', 'Gestión:')}</span>
                        <button
                          onClick={() => setMemberToRemove(mem)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 hover:bg-rose-600 hover:text-white dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white text-xs font-semibold transition-all shadow-xs"
                          title={t('action.remove_from_project', 'Eliminar del proyecto')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{t('action.remove_from_project', 'Eliminar del proyecto')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Activity Log */}
      {activeTab === 'activity' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {t('pdetail.tab_activity', 'Auditoría de Actividad del Proyecto')}
          </h3>
          {projectLogs.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              {t('charts.no_tasks', 'No hay eventos de auditoría registrados para este proyecto aún.')}
            </p>
          ) : (
            <div className="space-y-3">
              {projectLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-slate-800 dark:text-slate-200 font-medium">
                      {log.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span>{log.userName}</span>
                      <span>•</span>
                      <span>{formatDateTime(log.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
        defaultProjectId={project.id}
      />

      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        projectToEdit={project}
      />

      <ConfirmModal
        isOpen={confirmDeleteProject}
        title={t('projects.delete_modal_title', '¿Mover proyecto a la papelera?')}
        message={t('projects.delete_modal_msg', '¿Estás seguro de que deseas eliminar el proyecto "{title}" ({code})? Se trasladará a la papelera de recuperación.')
          .replace('{title}', project.title)
          .replace('{code}', project.code)}
        confirmText={t('projects.move_trash_btn', 'Mover a Papelera')}
        cancelText={t('action.cancel', 'Cancelar')}
        onConfirm={async () => {
          await deleteProject(project.id);
          setConfirmDeleteProject(false);
        }}
        onCancel={() => setConfirmDeleteProject(false)}
      />

      <ConfirmModal
        isOpen={!!memberToRemove}
        title={t('action.remove_from_project', '¿Retirar integrante?')}
        message={`¿Estás seguro de que deseas eliminar a "${memberToRemove?.user?.fullName}" del equipo operativo del proyecto "${project.title}" (${project.code})?`}
        confirmText={t('action.remove_from_project', 'Eliminar del Proyecto')}
        cancelText={t('action.cancel', 'Cancelar')}
        isDestructive={true}
        onConfirm={async () => {
          if (memberToRemove) {
            await removeMember(project.id, memberToRemove.id);
            setMemberToRemove(null);
          }
        }}
        onCancel={() => setMemberToRemove(null)}
      />
    </div>
  );
}
