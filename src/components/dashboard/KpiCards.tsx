'use client';

import React from 'react';
import {
  FolderKanban,
  CheckCircle2,
  XCircle,
  Clock,
  PlayCircle,
  AlertTriangle,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';

export function KpiCards() {
  const { stats, loading } = useData();
  const { t } = useLanguage();

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: t('kpi.active_projects', 'Proyectos Activos'),
      value: stats.activeProjects,
      subtitle: t('kpi.sub_active_projects', 'de {total} proyectos totales').replace('{total}', String(stats.totalProjects)),
      icon: FolderKanban,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/60 dark:border-indigo-800/60',
      link: '/proyectos?status=EN_PROGRESO',
    },
    {
      title: t('kpi.completed_projects', 'Proyectos Concluidos'),
      value: stats.completedProjects,
      subtitle: t('kpi.sub_completed_projects', 'Entregados al 100%'),
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-800/60',
      link: '/proyectos?status=CONCLUIDO',
    },
    {
      title: t('kpi.cancelled_projects', 'Proyectos Cancelados'),
      value: stats.cancelledProjects,
      subtitle: t('kpi.sub_cancelled_projects', 'Historial conservado'),
      icon: XCircle,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200/60 dark:border-rose-800/60',
      link: '/proyectos?status=CANCELADO',
    },
    {
      title: t('kpi.overdue_tasks', 'Tareas Atrasadas'),
      value: stats.overdueTasks,
      subtitle: t('kpi.sub_overdue_tasks', '¡Requieren atención inmediata!'),
      icon: AlertTriangle,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-100/70 dark:bg-rose-950/70 border-rose-300 dark:border-rose-800',
      isAlert: stats.overdueTasks > 0,
      link: '/tareas?filter=overdue',
    },
    {
      title: t('kpi.pending_tasks', 'Tareas Pendientes'),
      value: stats.pendingTasks,
      subtitle: t('kpi.sub_pending_tasks', 'Sin iniciar (0% avance)'),
      icon: Clock,
      color: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800',
      link: '/tareas?status=PENDIENTE',
    },
    {
      title: t('kpi.in_progress_tasks', 'Tareas En Progreso'),
      value: stats.inProgressTasks,
      subtitle: t('kpi.sub_in_progress_tasks', 'En desarrollo activo'),
      icon: PlayCircle,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200/60 dark:border-blue-800/60',
      link: '/tareas?status=EN_PROGRESO',
    },
    {
      title: t('kpi.completed_tasks', 'Tareas Concluidas'),
      value: stats.completedTasks,
      subtitle: t('kpi.sub_completed_tasks', 'Finalizadas satisfactoriamente'),
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-800/60',
      link: '/tareas?status=CONCLUIDO',
    },
    {
      title: t('kpi.total_tasks', 'Total de Tareas'),
      value: stats.totalTasks,
      subtitle: t('kpi.sub_total_tasks', 'Distribuidas en el sistema'),
      icon: Layers,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200/60 dark:border-purple-800/60',
      link: '/tareas',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <Link
            key={idx}
            href={kpi.link}
            className={`group p-4 rounded-2xl border transition-all duration-200 hover:shadow-md hover:scale-[1.01] ${kpi.bg}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {kpi.title}
              </span>
              <div className="flex items-center gap-1">
                <Icon className={`w-4 h-4 ${kpi.color} ${kpi.isAlert ? 'animate-bounce' : ''}`} />
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-black tracking-tight ${kpi.color}`}>
                {kpi.value}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
              {kpi.subtitle}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
