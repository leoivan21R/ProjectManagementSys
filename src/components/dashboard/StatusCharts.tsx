'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';

export function StatusCharts() {
  const { tasks, projects, loading } = useData();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
        <div className="h-72 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
        <div className="h-72 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  // Active tasks only (excluding soft-deleted)
  const activeTasks = tasks.filter((t) => !t.deletedAt);

  const pendingCount = activeTasks.filter((t) => t.status === 'PENDIENTE').length;
  const inProgressCount = activeTasks.filter((t) => t.status === 'EN_PROGRESO').length;
  const completedCount = activeTasks.filter((t) => t.status === 'CONCLUIDO').length;
  const cancelledCount = activeTasks.filter((t) => t.status === 'CANCELADO').length;

  const pieData = [
    { name: t('status.PENDIENTE', 'Pendientes'), value: pendingCount, color: '#94a3b8' }, // Slate-400 (Gris)
    { name: t('status.EN_PROGRESO', 'En progreso'), value: inProgressCount, color: '#2563eb' }, // Blue-600 (Azul)
    { name: t('status.CONCLUIDO', 'Concluidos'), value: completedCount, color: '#10b981' }, // Emerald-500 (Verde)
    { name: t('status.CANCELADO', 'Cancelados'), value: cancelledCount, color: '#f43f5e' }, // Rose-500 (Rojo)
  ].filter((item) => item.value > 0);

  // Bar chart: Project Progress Comparison
  const barData = projects
    .filter((p) => !p.deletedAt && p.status !== 'CANCELADO')
    .slice(0, 6)
    .map((p) => ({
      name: p.code,
      fullName: p.title,
      progreso: p.calculatedProgress || 0,
      tareas: p.tasksCount || 0,
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Task Status Distribution (Donut Chart) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {t('charts.task_dist', 'Distribución de Tareas por Estado')}
          </h3>
          <p className="text-xs text-slate-500">
            {t('charts.task_dist_sub', 'Proporción en tiempo real según los colores oficiales del sistema.')}
          </p>
        </div>

        <div className="h-64 w-full flex items-center justify-center">
          {pieData.length === 0 ? (
            <p className="text-xs text-slate-400">{t('charts.no_tasks', 'Sin tareas registradas para graficar')}</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: unknown) => [`${Number(val)} ${t('charts.tasks', 'tareas')}`, t('charts.qty', 'Cantidad')]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs text-slate-600 dark:text-slate-400">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Project Progress (Bar Chart) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {t('charts.proj_prog', 'Avance General por Proyecto (%)')}
          </h3>
          <p className="text-xs text-slate-500">
            {t('charts.proj_prog_sub', 'Promedio ponderado de tareas activas (excluyendo canceladas).')}
          </p>
        </div>

        <div className="h-64 w-full">
          {barData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              {t('charts.no_projects', 'Sin proyectos activos para comparar')}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  interval={0}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v) => `${v}%`}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(val: unknown) => [`${Number(val)}%`, t('charts.general_progress', 'Avance general')]}
                  labelFormatter={(name) => {
                    const found = barData.find((b) => b.name === name);
                    return found ? `${found.name}: ${found.fullName}` : name;
                  }}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="progreso" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
