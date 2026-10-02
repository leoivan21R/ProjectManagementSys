'use client';

import React, { useState } from 'react';
import {
  Edit2,
  Copy,
  Trash2,
  MessageSquare,
  Mail,
  AlertCircle,
  Archive,
  ArrowUpDown,
  MoreVertical,
  CheckCircle,
} from 'lucide-react';
import { Task, TaskStatus } from '@/lib/types';
import { formatDate, getTaskStatusConfig, getPriorityConfig } from '@/lib/utils';
import { ProgressBar } from '@/components/common/ProgressBar';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { TaskCommentsModal } from './TaskCommentsModal';
import { FollowUpEmailModal } from './FollowUpEmailModal';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Image from 'next/image';

interface TaskTableProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  showProjectColumn?: boolean;
}

type SortField = 'code' | 'title' | 'dueDate' | 'progress' | 'status';
type SortOrder = 'asc' | 'desc';

export function TaskTable({ tasks, onEditTask, showProjectColumn = false }: TaskTableProps) {
  const { updateTask, deleteTask, duplicateTask } = useData();
  const { canEditTask } = useAuth();
  const { t } = useLanguage();

  const [sortField, setSortField] = useState<SortField>('code');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Modals state
  const [taskForComments, setTaskForComments] = useState<Task | null>(null);
  const [taskForEmail, setTaskForEmail] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // Sorting
  const sortedTasks = [...tasks].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'code') comparison = a.code.localeCompare(b.code);
    else if (sortField === 'title') comparison = a.title.localeCompare(b.title);
    else if (sortField === 'dueDate') comparison = a.dueDate.localeCompare(b.dueDate);
    else if (sortField === 'progress') comparison = a.progress - b.progress;
    else if (sortField === 'status') comparison = a.status.localeCompare(b.status);
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleQuickStatusChange = async (task: Task, newStatus: TaskStatus) => {
    try {
      await updateTask(task.id, { status: newStatus });
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      await deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    } catch (e) {
      console.error(e);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <CheckCircle className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
        <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
          {t('tasks.no_tasks_found', 'No hay tareas en esta vista')}
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          {t('tasks.sub', 'Crea una nueva tarea utilizando el botón para comenzar el seguimiento.')}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          {/* Table Header */}
          <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 select-none">
            <tr>
              <th
                onClick={() => toggleSort('code')}
                className="py-3.5 px-4 cursor-pointer hover:text-indigo-600 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>1. {t('tasks.col_code', 'ID')}</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>

              <th
                onClick={() => toggleSort('title')}
                className="py-3.5 px-4 cursor-pointer hover:text-indigo-600 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>2. {t('tasks.col_task', 'Nombre de la Tarea')}</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>

              {showProjectColumn && (
                <th className="py-3.5 px-4 whitespace-nowrap">{t('tasks.col_project', 'Proyecto')}</th>
              )}

              <th className="py-3.5 px-4 hidden md:table-cell max-w-[200px]">3. {t('tasks.col_desc', 'Descripción')}</th>

              <th className="py-3.5 px-3 whitespace-nowrap hidden lg:table-cell">4. {t('tasks.col_start', 'Comienzo')}</th>

              <th
                onClick={() => toggleSort('dueDate')}
                className="py-3.5 px-3 cursor-pointer hover:text-indigo-600 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>5. {t('tasks.col_due', 'Culminación')}</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>

              <th className="py-3.5 px-4 whitespace-nowrap">6. {t('tasks.col_assignee', 'Responsable')}</th>

              <th
                onClick={() => toggleSort('progress')}
                className="py-3.5 px-3 cursor-pointer hover:text-indigo-600 transition-colors whitespace-nowrap min-w-[140px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>7 & 8. {t('tasks.col_progress', 'Avance')}</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>

              <th
                onClick={() => toggleSort('status')}
                className="py-3.5 px-3 cursor-pointer hover:text-indigo-600 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1.5">
                  <span>9. {t('tasks.col_status', 'Estado')}</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>

              <th className="py-3.5 px-3 text-center whitespace-nowrap">10. {t('tasks.comments', 'Comentarios')}</th>

              <th className="py-3.5 px-4 text-right whitespace-nowrap">11. {t('tasks.col_actions', 'Acciones')}</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {sortedTasks.map((task) => {
              const statusCfg = getTaskStatusConfig(task.status, t);
              const priorityCfg = getPriorityConfig(task.priority, t);
              const editable = canEditTask(task);

              return (
                <tr
                  key={task.id}
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                    task.isOverdue ? 'bg-rose-50/30 dark:bg-rose-950/15' : ''
                  }`}
                >
                  {/* 1. Code & Overdue Badge */}
                  <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {task.code}
                      </span>
                      {task.isOverdue && (
                        <span
                          className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-600 bg-rose-100 dark:bg-rose-950/80 dark:text-rose-400 px-1.5 py-0.5 rounded-full border border-rose-300 dark:border-rose-800 animate-pulse"
                          title="Tarea atrasada: fecha límite superada"
                        >
                          <AlertCircle className="w-2.5 h-2.5" />
                          {t('tasks.overdue_badge', '¡Atrasada!')}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 2. Title & Priority */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                      {task.title}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${priorityCfg.badge}`}>
                        {priorityCfg.label}
                      </span>
                      {task.archived && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600">
                          {t('projects.archived_badge', 'Archivada')}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Optional Project Name */}
                  {showProjectColumn && (
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                        {task.project?.title || 'N/A'}
                      </span>
                    </td>
                  )}

                  {/* 3. Description */}
                  <td className="py-3 px-4 hidden md:table-cell text-slate-500 dark:text-slate-400 line-clamp-2 max-w-[200px]">
                    {task.description || <span className="italic opacity-50">{t('tasks.no_desc', 'Sin descripción')}</span>}
                  </td>

                  {/* 4. Start Date */}
                  <td className="py-3 px-3 whitespace-nowrap text-slate-500 hidden lg:table-cell">
                    {formatDate(task.startDate)}
                  </td>

                  {/* 5. Due Date */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={task.isOverdue ? 'font-bold text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}>
                      {formatDate(task.dueDate)}
                    </span>
                  </td>

                  {/* 6. Assignee */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {task.assignee?.avatarUrl && (
                        <Image
                          src={task.assignee.avatarUrl}
                          alt={task.assignee.fullName}
                          width={24}
                          height={24}
                          className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          unoptimized
                        />
                      )}
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200 text-xs">
                          {task.assignee?.fullName || t('tasks.unassigned', 'Sin Asignar')}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* 7 & 8. Progress (Bar + Number) */}
                  <td className="py-3 px-3">
                    <div className="w-36">
                      <ProgressBar progress={task.progress} status={task.status} size="sm" showLabel />
                    </div>
                  </td>

                  {/* 9. Status (Dropdown with color badges) */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <select
                      value={task.status}
                      disabled={!editable}
                      onChange={(e) => handleQuickStatusChange(task, e.target.value as TaskStatus)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${statusCfg.bg} cursor-pointer focus:outline-none`}
                    >
                      <option value="PENDIENTE">{t('status.PENDIENTE', 'Pendiente')}</option>
                      <option value="EN_PROGRESO">{t('status.EN_PROGRESO', 'En Progreso')}</option>
                      <option value="CONCLUIDO">{t('status.CONCLUIDO', 'Concluido')}</option>
                      <option value="CANCELADO">{t('status.CANCELADO', 'Cancelado')}</option>
                    </select>
                  </td>

                  {/* 10. Comments Badge */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => setTaskForComments(task)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                      title={t('tasks.view_comments', 'Ver y añadir comentarios')}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span>{task.commentsCount || 0}</span>
                    </button>
                  </td>

                  {/* 11. Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {/* Follow-up email button */}
                      <button
                        onClick={() => setTaskForEmail(task)}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition-colors"
                        title={t('tasks.email_followup', 'Enviar seguimiento por correo')}
                      >
                        <Mail className="w-4 h-4" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => onEditTask(task)}
                        disabled={!editable}
                        className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-30"
                        title={t('tasks.edit_btn', 'Editar tarea')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Duplicate */}
                      <button
                        onClick={() => duplicateTask(task.id)}
                        className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title={t('tasks.duplicate_btn', 'Duplicar tarea')}
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {/* Delete to trash */}
                      <button
                        onClick={() => setTaskToDelete(task)}
                        disabled={!editable}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors disabled:opacity-30"
                        title={t('tasks.delete_btn', 'Trasladar a la papelera')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Task Comments Modal */}
      <TaskCommentsModal
        isOpen={Boolean(taskForComments)}
        onClose={() => setTaskForComments(null)}
        task={taskForComments}
      />

      {/* Follow-up Email Modal */}
      <FollowUpEmailModal
        isOpen={Boolean(taskForEmail)}
        onClose={() => setTaskForEmail(null)}
        task={taskForEmail}
      />

      {/* Confirmation Modal before Soft-deleting */}
      <ConfirmModal
        isOpen={Boolean(taskToDelete)}
        title={t('tasks.delete_modal_title', '¿Mover tarea a la papelera?')}
        message={t('tasks.delete_modal_msg', '¿Estás seguro de que deseas eliminar la tarea "{title}" ({code})? Se trasladará a la papelera de recuperación, donde podrás restaurarla o eliminarla definitivamente.')
          .replace('{title}', taskToDelete?.title || '')
          .replace('{code}', taskToDelete?.code || '')}
        confirmText={t('projects.move_trash_btn', 'Mover a Papelera')}
        cancelText={t('tasks.keep_task_btn', 'Conservar Tarea')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />
    </>
  );
}
