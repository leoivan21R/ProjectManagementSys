'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Calendar, User, Flag, Activity } from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '@/lib/types';
import { useData } from '@/context/DataContext';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  defaultProjectId?: string;
}

export function TaskModal({ isOpen, onClose, taskToEdit, defaultProjectId }: TaskModalProps) {
  const { projects, users, createTask, updateTask } = useData();

  const [projectId, setProjectId] = useState(defaultProjectId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<TaskStatus>('PENDIENTE');
  const [priority, setPriority] = useState<TaskPriority>('MEDIA');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setProjectId(taskToEdit.projectId);
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setStartDate(taskToEdit.startDate);
      setDueDate(taskToEdit.dueDate);
      setAssigneeId(taskToEdit.assigneeId);
      setProgress(taskToEdit.progress);
      setStatus(taskToEdit.status);
      setPriority(taskToEdit.priority);
    } else {
      setProjectId(defaultProjectId || (projects[0]?.id || ''));
      setTitle('');
      setDescription('');
      const today = new Date().toISOString().split('T')[0];
      const twoWeeksLater = new Date();
      twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
      setStartDate(today);
      setDueDate(twoWeeksLater.toISOString().split('T')[0]);
      setAssigneeId(users[0]?.id || '');
      setProgress(0);
      setStatus('PENDIENTE');
      setPriority('MEDIA');
    }
    setErrorMsg('');
  }, [taskToEdit, defaultProjectId, projects, users, isOpen]);

  if (!isOpen) return null;

  // Rule 6: Handle status change with automatic progress adjustment
  const handleStatusChange = (newStatus: TaskStatus) => {
    setStatus(newStatus);
    if (newStatus === 'CONCLUIDO') {
      setProgress(100);
    } else if (newStatus === 'PENDIENTE') {
      setProgress(0);
    }
  };

  // Handle slider change: if 100% -> auto set Concluido
  const handleProgressChange = (newProgress: number) => {
    setProgress(newProgress);
    if (newProgress === 100 && status !== 'CONCLUIDO') {
      setStatus('CONCLUIDO');
    } else if (newProgress > 0 && status === 'PENDIENTE') {
      setStatus('EN_PROGRESO');
    } else if (newProgress === 0 && status === 'EN_PROGRESO') {
      setStatus('PENDIENTE');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!projectId) {
      setErrorMsg('Debes seleccionar un proyecto');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('El nombre de la tarea es obligatorio');
      return;
    }
    if (!startDate || !dueDate) {
      setErrorMsg('Debes especificar fecha de inicio y fecha de culminación');
      return;
    }
    if (new Date(dueDate) < new Date(startDate)) {
      setErrorMsg('La fecha estimada de culminación no puede ser anterior a la de comienzo');
      return;
    }
    if (!assigneeId) {
      setErrorMsg('Debes asignar un responsable para la tarea');
      return;
    }

    setIsSubmitting(true);
    try {
      if (taskToEdit) {
        await updateTask(taskToEdit.id, {
          projectId,
          title: title.trim(),
          description: description.trim(),
          startDate,
          dueDate,
          assigneeId,
          progress,
          status,
          priority,
        });
      } else {
        await createTask({
          projectId,
          title: title.trim(),
          description: description.trim(),
          startDate,
          dueDate,
          assigneeId,
          progress,
          status,
          priority,
        });
      }
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al guardar la tarea');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200 dark:border-sky-800">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {taskToEdit ? 'Editar Tarea' : 'Añadir Nueva Tarea'}
              </h2>
              <p className="text-xs text-slate-500">
                {taskToEdit ? `Identificador: ${taskToEdit.code}` : 'El identificador se asignará automáticamente'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Project Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Proyecto Asociado *
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {projects.filter((p) => !p.deletedAt).map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.code}] {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Nombre de la Tarea *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Implementar pasarela de pagos con tokenización"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Descripción Detallada
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Especificaciones, criterios de aceptación o notas de implementación..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Fecha de Comienzo *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Fecha Estimada Fin *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Assignee & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" /> Persona Responsable *
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.jobTitle})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Flag className="w-3.5 h-3.5 text-slate-400" /> Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
                <option value="CRITICA">Crítica</option>
              </select>
            </div>
          </div>

          {/* Status & Progress Slider (Rule 6) */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Estado de la Tarea
              </label>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="PENDIENTE">Gris: Pendiente</option>
                <option value="EN_PROGRESO">Azul: En progreso</option>
                <option value="CONCLUIDO">Verde: Concluido</option>
                <option value="CANCELADO">Rojo: Cancelado</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span>Porcentaje de Avance</span>
                <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                  {progress}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(e) => handleProgressChange(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0% (Inicio)</span>
                <span>50% (Medio)</span>
                <span>100% (Concluido)</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              Regla automática: Concluido fija el avance en 100%. Pendiente fija el avance en 0%.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-60"
            >
              {isSubmitting ? 'Guardando...' : taskToEdit ? 'Actualizar Tarea' : 'Guardar Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
