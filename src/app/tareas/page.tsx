'use client';

import React, { useState } from 'react';
import { CheckSquare, Plus, Search, Filter, AlertTriangle } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { TaskTable } from '@/components/tasks/TaskTable';
import { TaskModal } from '@/components/tasks/TaskModal';
import { Task, TaskStatus, TaskPriority } from '@/lib/types';

export default function TareasPage() {
  const { tasks, projects, users } = useData();
  const { canCreateProject } = useAuth();
  const { t } = useLanguage();

  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('TODOS');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [priorityFilter, setPriorityFilter] = useState<string>('TODAS');
  const [assigneeFilter, setAssigneeFilter] = useState('TODOS');
  const [onlyOverdue, setOnlyOverdue] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Active tasks only (excluding soft-deleted)
  const activeTasks = tasks.filter((t) => !t.deletedAt);

  const filteredTasks = activeTasks.filter((t) => {
    const q = search.toLowerCase();
    const matchesSearch =
      t.title.toLowerCase().includes(q) ||
      t.code.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      (t.assignee?.fullName || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (projectFilter !== 'TODOS' && t.projectId !== projectFilter) return false;
    if (statusFilter !== 'TODOS' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'TODAS' && t.priority !== priorityFilter) return false;
    if (assigneeFilter !== 'TODOS' && t.assigneeId !== assigneeFilter) return false;
    if (onlyOverdue && !t.isOverdue) return false;

    return true;
  });

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <CheckSquare className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            {t('tasks.title', 'Administración Global de Tareas')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            {t('tasks.sub', 'Tabla interactiva con los 11 campos requeridos, avance porcentual, automatismos de estado, identificación de tareas atrasadas y seguimiento por correo electrónico.')}
          </p>
        </div>

        <button
          onClick={() => {
            setTaskToEdit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('tasks.new_task', 'Añadir Tarea')}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('tasks.search_ph', 'Buscar por código (ej: TSK-0101), nombre de tarea, descripción o responsable...')}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Project filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="TODOS">{t('tasks.all_projects', 'Todos los Proyectos')}</option>
            {projects.filter((p) => !p.deletedAt).map((p) => (
              <option key={p.id} value={p.id}>
                [{p.code}] {p.title}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="TODOS">{t('projects.all_statuses', 'Todos los Estados')}</option>
            <option value="PENDIENTE">{t('status.PENDIENTE', 'Pendiente')}</option>
            <option value="EN_PROGRESO">{t('status.EN_PROGRESO', 'En Progreso')}</option>
            <option value="CONCLUIDO">{t('status.CONCLUIDO', 'Concluido')}</option>
            <option value="CANCELADO">{t('status.CANCELADO', 'Cancelado')}</option>
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="TODAS">{t('projects.all_priorities', 'Todas las Prioridades')}</option>
            <option value="CRITICA">{t('priority.CRITICA', 'Crítica')}</option>
            <option value="ALTA">{t('priority.ALTA', 'Alta')}</option>
            <option value="MEDIA">{t('priority.MEDIA', 'Media')}</option>
            <option value="BAJA">{t('priority.BAJA', 'Baja')}</option>
          </select>

          {/* Assignee filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-medium"
          >
            <option value="TODOS">{t('tasks.all_assignees', 'Cualquier Responsable')}</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName}
              </option>
            ))}
          </select>

          {/* Only Overdue Toggle */}
          <button
            onClick={() => setOnlyOverdue(!onlyOverdue)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all border ${
              onlyOverdue
                ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-rose-400'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{t('tasks.only_overdue', 'Solo Atrasadas')}</span>
          </button>
        </div>
      </div>

      {/* Interactive Table */}
      <TaskTable
        tasks={filteredTasks}
        onEditTask={handleEditTask}
        showProjectColumn={true}
      />

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
      />
    </div>
  );
}
