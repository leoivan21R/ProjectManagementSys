'use client';

import React, { useState } from 'react';
import { ShieldCheck, Plus, Trash2, Edit3, Check, X, Mail, Briefcase, UserCheck } from 'lucide-react';
import { Project, ProjectAssistant } from '@/lib/types';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Image from 'next/image';

interface ProjectDirectionCardProps {
  project: Project;
}

export function ProjectDirectionCard({ project }: ProjectDirectionCardProps) {
  const { users, addAssistant, removeAssistant } = useData();
  const { canManageProject } = useAuth();
  const { t } = useLanguage();
  const editable = canManageProject(project);

  const [isAdding, setIsAdding] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || '');
  const [responsibility, setResponsibility] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available users for assistant that are not the PM
  const availableUsers = users.filter((u) => u.id !== project.managerId);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !responsibility.trim()) return;

    setIsSubmitting(true);
    try {
      await addAssistant(project.id, selectedUserId, responsibility.trim());
      setIsAdding(false);
      setResponsibility('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (assistantId: string) => {
    if (confirm(t('dir.confirm_remove', '¿Deseas remover este asistente del proyecto?'))) {
      await removeAssistant(project.id, assistantId);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            {t('dir.card_title', 'Dirección y Coordinación del Proyecto')}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('dir.card_sub', 'Estructura de liderazgo, Project Manager principal y asistentes con delegación operativa.')}
          </p>
        </div>

        {editable && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition-all border border-indigo-200 dark:border-indigo-800 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('dir.add_assistant', 'Añadir asistente')}</span>
          </button>
        )}
      </div>

      {/* 1. Project Manager Card */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          {t('dir.pm_title', 'Responsable Principal (Project Manager)')}
        </p>
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-200/80 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {project.manager?.avatarUrl && (
              <Image
                src={project.manager.avatarUrl}
                alt={project.manager.fullName}
                width={48}
                height={48}
                className="w-12 h-12 rounded-xl object-cover border-2 border-indigo-400 shadow-md"
                unoptimized
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {project.manager?.fullName || t('dir.no_pm', 'Sin Project Manager')}
                </h4>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-300">
                  {t('dir.pm_badge', 'Líder del Proyecto')}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {project.manager?.jobTitle} • {project.manager?.department}
              </p>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{project.manager?.email}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500">{t('dir.pm_title', 'Dirección Ejecutiva')}</span>
            <p className="text-[11px] text-slate-400">AML Consultant</p>
          </div>
        </div>
      </div>

      {/* 2. Assistants List */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t('dir.assistants_title', 'Asistentes de Dirección Asignados')} ({project.assistants?.length || 0})
          </p>
        </div>

        {/* Add Assistant Inline Form */}
        {isAdding && (
          <form
            onSubmit={handleAdd}
            className="p-4 mb-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-indigo-300 dark:border-indigo-800 animate-in fade-in space-y-3"
          >
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {t('dir.assign_assistant_title', 'Registrar nuevo asistente en este proyecto')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t('dir.select_user', 'Seleccionar del Directorio de Miembros:')}
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                >
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.jobTitle}) - {u.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t('dir.resp_label', 'Responsabilidad Principal Asignada:')}
                </label>
                <input
                  type="text"
                  required
                  value={responsibility}
                  onChange={(e) => setResponsibility(e.target.value)}
                  placeholder={t('dir.resp_placeholder', 'Ej: Coordinación de Pruebas UAT y Auditoría')}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:text-slate-900"
              >
                {t('action.cancel', 'Cancelar')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{t('dir.assign_btn', 'Confirmar y Añadir Asistente')}</span>
              </button>
            </div>
          </form>
        )}

        {/* List */}
        {!project.assistants || project.assistants.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            {t('dir.no_assistants', 'No hay asistentes asignados a este proyecto.')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {project.assistants.map((ast) => (
              <div
                key={ast.id}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-start justify-between gap-3 shadow-xs"
              >
                <div className="flex items-start gap-3">
                  {ast.user?.avatarUrl && (
                    <Image
                      src={ast.user.avatarUrl}
                      alt={ast.user.fullName}
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                      unoptimized
                    />
                  )}
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      {ast.user?.fullName}
                    </h5>
                    <div className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                      <Briefcase className="w-3 h-3" />
                      <span>{ast.responsibility}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                      <Mail className="w-3 h-3" />
                      <span>{ast.user?.email}</span>
                    </div>
                  </div>
                </div>

                {editable && (
                  <button
                    onClick={() => handleRemove(ast.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors flex-shrink-0"
                    title={t('action.remove_from_project', 'Remover asistente')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
