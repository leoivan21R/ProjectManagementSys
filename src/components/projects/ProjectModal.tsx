'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ShieldCheck, Calendar, Flag, Sparkles, UserPlus } from 'lucide-react';
import { Project, ProjectPriority, ProjectStatus } from '@/lib/types';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { MemberModal } from '@/components/team/MemberModal';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: Project | null;
}

export function ProjectModal({ isOpen, onClose, projectToEdit }: ProjectModalProps) {
  const { users, createProject, updateProject } = useData();
  const { t } = useLanguage();

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [startDate, setStartDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState<ProjectPriority>('MEDIA');
  const [status, setStatus] = useState<ProjectStatus>('PLANIFICACION');
  const [managerId, setManagerId] = useState('');
  const [objectives, setObjectives] = useState<string[]>(['']);
  const [assistants, setAssistants] = useState<{ userId: string; responsibility: string }[]>([]);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-calculated code preview for new projects
  const currentYear = new Date().getFullYear();
  const previewCode = projectToEdit ? projectToEdit.code : `PRJ-${currentYear}-AUTO`;

  useEffect(() => {
    if (projectToEdit) {
      setTitle(projectToEdit.title);
      setSummary(projectToEdit.summary);
      setStartDate(projectToEdit.startDate);
      setTargetDate(projectToEdit.targetDate);
      setPriority(projectToEdit.priority);
      setStatus(projectToEdit.status);
      setManagerId(projectToEdit.managerId);
      setObjectives(projectToEdit.objectives && projectToEdit.objectives.length > 0 ? projectToEdit.objectives : ['']);
      setAssistants(
        projectToEdit.assistants?.map((a) => ({
          userId: a.userId,
          responsibility: a.responsibility,
        })) || []
      );
    } else {
      // Defaults for new project
      setTitle('');
      setSummary('');
      const today = new Date().toISOString().split('T')[0];
      const threeMonthsLater = new Date();
      threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
      setStartDate(today);
      setTargetDate(threeMonthsLater.toISOString().split('T')[0]);
      setPriority('MEDIA');
      setStatus('PLANIFICACION');
      // Default to first PM or Admin
      const defaultPm = users.find((u) => u.role === 'PROJECT_MANAGER' || u.role === 'ADMIN');
      setManagerId(defaultPm?.id || users[0]?.id || '');
      setObjectives(['Garantizar cumplimiento de los estándares de calidad definidos.']);
      setAssistants([]);
    }
    setErrorMsg('');
  }, [projectToEdit, users, isOpen]);

  if (!isOpen) return null;

  // Handlers for objectives
  const handleAddObjective = () => setObjectives((prev) => [...prev, '']);
  const handleRemoveObjective = (idx: number) => setObjectives((prev) => prev.filter((_, i) => i !== idx));
  const handleObjectiveChange = (idx: number, val: string) => {
    setObjectives((prev) => {
      const copy = [...prev];
      copy[idx] = val;
      return copy;
    });
  };

  // Handlers for assistants
  const handleAddAssistant = () => {
    if (!users || users.length === 0) {
      setIsMemberModalOpen(true);
      return;
    }

    // Try to pick an available user not yet in assistants and not the manager
    const unusedNonManager = users.find(
      (u) => u.id !== managerId && !assistants.some((a) => a.userId === u.id)
    );
    // If all non-managers are already assistants, try any non-manager
    const nonManager = users.find((u) => u.id !== managerId);
    // If none, try any user not yet in assistants
    const unusedAny = users.find((u) => !assistants.some((a) => a.userId === u.id));
    // Fallback to first available user
    const fallbackUser = unusedNonManager || nonManager || unusedAny || users[0];

    setAssistants((prev) => [
      ...prev,
      {
        userId: fallbackUser.id,
        responsibility: 'Coordinación y Apoyo Operativo',
      },
    ]);
  };

  const handleRemoveAssistant = (idx: number) => {
    setAssistants((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAssistantUserChange = (idx: number, newUserId: string) => {
    setAssistants((prev) => {
      const copy = [...prev];
      copy[idx].userId = newUserId;
      return copy;
    });
  };

  const handleAssistantRespChange = (idx: number, newResp: string) => {
    setAssistants((prev) => {
      const copy = [...prev];
      copy[idx].responsibility = newResp;
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('El título del proyecto es obligatorio');
      return;
    }
    if (!startDate || !targetDate) {
      setErrorMsg('Debes especificar la fecha de inicio y la fecha estimada de culminación');
      return;
    }
    if (new Date(targetDate) < new Date(startDate)) {
      setErrorMsg('La fecha estimada de culminación no puede ser anterior a la fecha de inicio');
      return;
    }
    if (!managerId) {
      setErrorMsg('Debes designar un Project Manager');
      return;
    }

    setIsSubmitting(true);
    try {
      const filteredObjectives = objectives.map((o) => o.trim()).filter(Boolean);

      if (projectToEdit) {
        await updateProject(projectToEdit.id, {
          title: title.trim(),
          summary: summary.trim(),
          startDate,
          targetDate,
          priority,
          status,
          managerId,
          objectives: filteredObjectives,
          assistantIds: assistants,
        });
      } else {
        await createProject({
          title: title.trim(),
          summary: summary.trim(),
          startDate,
          targetDate,
          priority,
          status,
          managerId,
          objectives: filteredObjectives,
          assistantIds: assistants,
        });
      }
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al guardar proyecto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {projectToEdit ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Código Asignado:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                  {previewCode}
                </span>
              </div>
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Project Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Título del Proyecto *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Implementación de Sistema de Pagos Digitales"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Dates & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Fecha Comienzo *
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
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Fecha Estimada Fin *
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Flag className="w-3.5 h-3.5 text-slate-400" />
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ProjectPriority)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
                <option value="CRITICA">Crítica</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Estado General
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="PLANIFICACION">Planificación</option>
                <option value="EN_PROGRESO">En Progreso</option>
                <option value="EN_PAUSA">En Pausa</option>
                <option value="CONCLUIDO">Concluido</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Resumen Introductorio del Proyecto
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Describe el contexto general, impacto esperado y alcance de este proyecto..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            />
          </div>

          {/* Project Manager Selection */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Dirección: Project Manager Responsable Principal *
            </label>
            <select
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.jobTitle}) - {u.email}
                </option>
              ))}
            </select>
          </div>

          {/* Project Manager Assistants */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Asistentes del Project Manager
                </p>
                <p className="text-[11px] text-slate-500">
                  Colaboradores asignados con responsabilidades de coordinación delegadas.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-all shadow-xs"
                  title="Incorporar un nuevo miembro al directorio corporativo"
                >
                  <UserPlus className="w-3.5 h-3.5 text-indigo-500" />
                  <span>+ Nuevo Miembro</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddAssistant}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir asistente</span>
                </button>
              </div>
            </div>

            {assistants.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-1">
                <p className="text-xs text-slate-500 font-medium">
                  No se han designado asistentes aún en este proyecto.
                </p>
                <p className="text-[11px] text-slate-400">
                  Pulsa el botón <strong className="text-indigo-600 dark:text-indigo-400">&ldquo;Añadir asistente&rdquo;</strong> para incorporar un colaborador.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {assistants.map((ast, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-center gap-2 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
                  >
                    <select
                      value={ast.userId}
                      onChange={(e) => handleAssistantUserChange(idx, e.target.value)}
                      className="w-full sm:w-1/2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName} ({u.jobTitle})
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={ast.responsibility}
                      onChange={(e) => handleAssistantRespChange(idx, e.target.value)}
                      placeholder="Responsabilidad principal (Ej: Coordinador de QA)"
                      className="w-full sm:flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAssistant(idx)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors flex-shrink-0"
                      title="Eliminar asistente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Objectives */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Objetivos Principales
              </label>
              <button
                type="button"
                onClick={handleAddObjective}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Añadir Objetivo
              </button>
            </div>
            <div className="space-y-2">
              {objectives.map((obj, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={obj}
                    onChange={(e) => handleObjectiveChange(idx, e.target.value)}
                    placeholder={`Objetivo ${idx + 1}`}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  {objectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveObjective(idx)}
                      className="p-2 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
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
              {isSubmitting ? 'Guardando...' : projectToEdit ? 'Actualizar Proyecto' : 'Guardar Proyecto'}
            </button>
          </div>
        </form>
      </div>

      {/* Member Creation Modal */}
      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
      />
    </div>
  );
}
