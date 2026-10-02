'use client';

import React, { useState } from 'react';
import { X, Mail, Copy, Check, ExternalLink, Send } from 'lucide-react';
import { Task } from '@/lib/types';
import { buildFollowUpEmail } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

interface FollowUpEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  projectName?: string;
}

export function FollowUpEmailModal({ isOpen, onClose, task, projectName }: FollowUpEmailModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !task) return null;

  const pName = projectName || task.project?.title || 'Proyecto en Curso';
  const emailData = buildFollowUpEmail(task, pName);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(emailData.body);
      setCopied(true);
      toast.success('Contenido del correo copiado al portapapeles');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('No se pudo copiar el texto');
    }
  };

  const handleOpenMailto = () => {
    window.location.href = emailData.mailtoUrl;
    toast.info('Abriendo cliente de correo predeterminado...');
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
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Preparar Seguimiento por Correo
              </h2>
              <p className="text-xs text-slate-500">
                Se enviará al responsable de la tarea tras tu confirmación.
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
            <strong>Confirmación requerida:</strong> El sistema nunca despacha correos automáticamente sin que tú verifiques los datos y lo abras en tu gestor o lo copies.
          </div>

          {/* Metadata preview */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-slate-500">Destinatario:</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">
                {task.assignee?.fullName} &lt;{task.assignee?.email || 'Sin correo registrado'}&gt;
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-slate-500">Asunto:</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                {emailData.subject}
              </span>
            </div>
          </div>

          {/* Message Body Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Cuerpo del Mensaje Preparado
            </label>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
              {emailData.body}
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado' : 'Copiar al portapapeles'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleOpenMailto}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir en mi gestor de correo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
