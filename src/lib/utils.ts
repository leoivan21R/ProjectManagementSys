import { Task, TaskPriority, TaskStatus, ProjectPriority, ProjectStatus } from './types';

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'Sin fecha';
  try {
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(isoStr?: string | null): string {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    return d.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoStr;
  }
}

// Rule 6: Color standards for task statuses
export function getTaskStatusConfig(status: TaskStatus, t?: (key: string, defaultText?: string) => string) {
  const getLabel = (key: string, def: string) => (t ? t(key, def) : def);
  switch (status) {
    case 'PENDIENTE':
      return {
        label: getLabel('status.PENDIENTE', 'Pendiente'),
        bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
        progressBarBg: 'bg-slate-400',
        dot: 'bg-slate-400',
      };
    case 'EN_PROGRESO':
      return {
        label: getLabel('status.EN_PROGRESO', 'En progreso'),
        bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        progressBarBg: 'bg-blue-600',
        dot: 'bg-blue-500',
      };
    case 'CONCLUIDO':
      return {
        label: getLabel('status.CONCLUIDO', 'Concluido'),
        bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        progressBarBg: 'bg-emerald-600',
        dot: 'bg-emerald-500',
      };
    case 'CANCELADO':
      return {
        label: getLabel('status.CANCELADO', 'Cancelado'),
        bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        progressBarBg: 'bg-rose-600',
        dot: 'bg-rose-500',
      };
    default:
      return {
        label: status,
        bg: 'bg-gray-100 text-gray-700 border-gray-300',
        progressBarBg: 'bg-gray-400',
        dot: 'bg-gray-400',
      };
  }
}

export function getProjectStatusConfig(status: ProjectStatus, t?: (key: string, defaultText?: string) => string) {
  const getLabel = (key: string, def: string) => (t ? t(key, def) : def);
  switch (status) {
    case 'PLANIFICACION':
      return {
        label: getLabel('status.PLANIFICACION', 'Planificación'),
        bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500',
      };
    case 'EN_PROGRESO':
      return {
        label: getLabel('status.EN_PROGRESO', 'En progreso'),
        bg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        dot: 'bg-indigo-500',
      };
    case 'EN_PAUSA':
      return {
        label: getLabel('status.EN_PAUSA', 'En pausa'),
        bg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border-amber-300',
        dot: 'bg-amber-600',
      };
    case 'CONCLUIDO':
      return {
        label: getLabel('status.CONCLUIDO', 'Concluido'),
        bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        dot: 'bg-emerald-500',
      };
    case 'CANCELADO':
      return {
        label: getLabel('status.CANCELADO', 'Cancelado'),
        bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        dot: 'bg-rose-500',
      };
    default:
      return {
        label: status,
        bg: 'bg-gray-100 text-gray-700 border-gray-200',
        dot: 'bg-gray-400',
      };
  }
}

export function getPriorityConfig(priority: ProjectPriority | TaskPriority, t?: (key: string, defaultText?: string) => string) {
  const getLabel = (key: string, def: string) => (t ? t(key, def) : def);
  switch (priority) {
    case 'CRITICA':
      return {
        label: getLabel('priority.CRITICA', 'Crítica'),
        bg: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300 dark:border-red-800',
        badge: 'text-red-600 bg-red-50 dark:bg-red-950/50 border border-red-200',
      };
    case 'ALTA':
      return {
        label: getLabel('priority.ALTA', 'Alta'),
        bg: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-300 dark:border-orange-800',
        badge: 'text-orange-600 bg-orange-50 dark:bg-orange-950/50 border border-orange-200',
      };
    case 'MEDIA':
      return {
        label: getLabel('priority.MEDIA', 'Media'),
        bg: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300 dark:border-sky-800',
        badge: 'text-sky-600 bg-sky-50 dark:bg-sky-950/50 border border-sky-200',
      };
    case 'BAJA':
      return {
        label: getLabel('priority.BAJA', 'Baja'),
        bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
        badge: 'text-slate-600 bg-slate-50 dark:bg-slate-800 border border-slate-200',
      };
    default:
      return {
        label: priority,
        bg: 'bg-gray-100 text-gray-800 border-gray-200',
        badge: 'text-gray-600 bg-gray-50 border border-gray-200',
      };
  }
}

// Rule 8: Generador de correo de seguimiento pre-estructurado
export function buildFollowUpEmail(task: Task, projectName: string) {
  const recipient = task.assignee?.email || '';
  const assigneeName = task.assignee?.fullName || 'Responsable';
  const statusConfig = getTaskStatusConfig(task.status);

  const subject = `[PMS] Solicitud de Seguimiento: ${task.title} (${projectName})`;

  const body = `Hola ${assigneeName},

Te contacto a través de Project Manager System (PMS) para solicitar una actualización del estado y avance de la siguiente tarea asignada:

DETALLES DE LA TAREA:
--------------------------------------------------
* Proyecto: ${projectName}
* Identificador: ${task.code}
* Tarea: ${task.title}
* Descripción: ${task.description || 'Sin descripción adicional'}
* Estado Actual: ${statusConfig.label}
* Porcentaje de Avance Registrado: ${task.progress}%
* Fecha de Inicio: ${formatDate(task.startDate)}
* Fecha Estimada de Culminación: ${formatDate(task.dueDate)}
--------------------------------------------------

SOLICITUD:
Por favor, confirma si la fecha estimada se mantiene o si presentas algún impedimento/bloqueo que requiera apoyo del equipo de coordinación.
Asimismo, te invitamos a registrar cualquier novedad o comentario en la plataforma PMS.

Saludos cordiales,
Equipo de Dirección y Coordinación de Proyectos
Project Manager System (PMS)`;

  const mailtoUrl = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return {
    recipient,
    assigneeName,
    subject,
    body,
    mailtoUrl,
  };
}
