'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { Task, Project, TaskStatus, TaskPriority } from '@/lib/types';
import { formatDate, formatDateTime, getTaskStatusConfig, getProjectStatusConfig } from '@/lib/utils';
import { ProgressBar } from '@/components/common/ProgressBar';
import { exportReportToExcel } from '@/lib/export/excelExport';
import { exportReportToPdf } from '@/lib/export/pdfExport';
import { useToast } from '@/context/ToastContext';
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

export default function ReportesPage() {
  const { projects, tasks, users } = useData();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [projectId, setProjectId] = useState<string>('TODOS');
  const [managerId, setManagerId] = useState<string>('TODOS');
  const [assistantId, setAssistantId] = useState<string>('TODOS');
  const [assigneeId, setAssigneeId] = useState<string>('TODOS');
  const [taskStatus, setTaskStatus] = useState<string>('TODOS');
  const [priority, setPriority] = useState<string>('TODAS');
  const [startDateFrom, setStartDateFrom] = useState('');
  const [dueDateTo, setDueDateTo] = useState('');
  const [onlyOverdue, setOnlyOverdue] = useState(false);

  // Active items
  const activeProjects = projects.filter((p) => !p.deletedAt);
  const activeTasks = tasks.filter((t) => !t.deletedAt);

  // Apply combined filters
  const filteredProjects = activeProjects.filter((p) => {
    if (projectId !== 'TODOS' && p.id !== projectId) return false;
    if (managerId !== 'TODOS' && p.managerId !== managerId) return false;
    if (assistantId !== 'TODOS' && !p.assistants?.some((a) => a.userId === assistantId)) return false;
    return true;
  });

  const matchingProjectIds = new Set(filteredProjects.map((p) => p.id));

  const filteredTasks = activeTasks.filter((t) => {
    if (!matchingProjectIds.has(t.projectId)) return false;
    if (assigneeId !== 'TODOS' && t.assigneeId !== assigneeId) return false;
    if (taskStatus !== 'TODOS' && t.status !== taskStatus) return false;
    if (priority !== 'TODAS' && t.priority !== priority) return false;
    if (startDateFrom && t.startDate < startDateFrom) return false;
    if (dueDateTo && t.dueDate > dueDateTo) return false;
    if (onlyOverdue && !t.isOverdue) return false;
    return true;
  });

  const resetFilters = () => {
    setProjectId('TODOS');
    setManagerId('TODOS');
    setAssistantId('TODOS');
    setAssigneeId('TODOS');
    setTaskStatus('TODOS');
    setPriority('TODAS');
    setStartDateFrom('');
    setDueDateTo('');
    setOnlyOverdue(false);
  };

  // Generation timestamp
  const now = new Date().toISOString();

  // Export handlers
  const handleExportPdf = () => {
    try {
      const summaryText = `Proyecto: ${projectId !== 'TODOS' ? projects.find((p) => p.id === projectId)?.title : 'Todos'} | Estado: ${taskStatus} | Atrasadas: ${onlyOverdue ? 'Solo atrasadas' : 'Todas'}`;
      exportReportToPdf({
        projects: filteredProjects,
        tasks: filteredTasks,
        reportTitle: projectId !== 'TODOS' ? `Reporte de Proyecto: ${projects.find((p) => p.id === projectId)?.title}` : 'Reporte Ejecutivo General de Proyectos y Tareas',
        filterSummary: summaryText,
      });
      toast.success('Documento PDF generado y descargado exitosamente');
    } catch (e) {
      console.error(e);
      toast.error('Error al exportar a PDF');
    }
  };

  const handleExportExcel = () => {
    try {
      const summaryText = `Proyecto: ${projectId !== 'TODOS' ? projects.find((p) => p.id === projectId)?.title : 'Todos'} | Filtro Estado: ${taskStatus}`;
      exportReportToExcel({
        projects: filteredProjects,
        tasks: filteredTasks,
        reportTitle: 'Reporte Ejecutivo PMS',
        filterSummary: summaryText,
      });
      toast.success('Libro de Excel (.xlsx) generado y descargado');
    } catch (e) {
      console.error(e);
      toast.error('Error al exportar a Excel');
    }
  };

  // Chart data for filtered tasks
  const pieData = [
    { name: t('status.PENDIENTE', 'Pendientes'), value: filteredTasks.filter((t) => t.status === 'PENDIENTE').length, color: '#94a3b8' },
    { name: t('status.EN_PROGRESO', 'En progreso'), value: filteredTasks.filter((t) => t.status === 'EN_PROGRESO').length, color: '#2563eb' },
    { name: t('status.CONCLUIDO', 'Concluidos'), value: filteredTasks.filter((t) => t.status === 'CONCLUIDO').length, color: '#10b981' },
    { name: t('status.CANCELADO', 'Cancelados'), value: filteredTasks.filter((t) => t.status === 'CANCELADO').length, color: '#f43f5e' },
  ].filter((d) => d.value > 0);

  const barData = filteredProjects.slice(0, 8).map((p) => ({
    name: p.code,
    progreso: p.calculatedProgress || 0,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            {t('reports.title', 'Módulo de Reportes Ejecutivos')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            {t('reports.sub', 'Genera auditorías individuales o consolidadas con filtros combinables, gráficos en tiempo real y exportación formal en PDF y Excel con marca de tiempo.')}
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
            title="Exportar reporte a Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t('action.export_excel', 'Exportar Excel')}</span>
          </button>

          <button
            onClick={handleExportPdf}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
            title="Exportar reporte a PDF"
          >
            <FileText className="w-4 h-4" />
            <span>{t('action.export_pdf', 'Exportar PDF')}</span>
          </button>
        </div>
      </div>

      {/* Multi-Filters Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{t('reports.filters_title', 'Filtros Combinables para el Reporte')}</span>
          </div>

          <button
            onClick={resetFilters}
            className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> {t('reports.reset_filters', 'Limpiar filtros')}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
          {/* Project */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('reports.select_project', 'Proyecto:')}</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            >
              <option value="TODOS">{t('tasks.all_projects', 'Todos los Proyectos')}</option>
              {activeProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.code}] {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Project Manager */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('reports.select_pm', 'Project Manager:')}</label>
            <select
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            >
              <option value="TODOS">{t('teams.all_profiles', 'Todos los PMs')}</option>
              {users
                .filter((u) => u.role === 'PROJECT_MANAGER' || u.role === 'ADMIN')
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName}
                  </option>
                ))}
            </select>
          </div>

          {/* Assistant */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('reports.select_assistant', 'Asistente de Dirección:')}</label>
            <select
              value={assistantId}
              onChange={(e) => setAssistantId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            >
              <option value="TODOS">{t('dir.assistants_title', 'Cualquier Asistente')}</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('reports.select_assignee', 'Responsable de Tarea:')}</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            >
              <option value="TODOS">{t('tasks.all_assignees', 'Todos los Responsables')}</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Task Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('reports.select_status', 'Estado de Tarea:')}</label>
            <select
              value={taskStatus}
              onChange={(e) => setTaskStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            >
              <option value="TODOS">{t('projects.all_statuses', 'Todos los Estados')}</option>
              <option value="PENDIENTE">{t('status.PENDIENTE', 'Pendiente')}</option>
              <option value="EN_PROGRESO">{t('status.EN_PROGRESO', 'En Progreso')}</option>
              <option value="CONCLUIDO">{t('status.CONCLUIDO', 'Concluido')}</option>
              <option value="CANCELADO">{t('status.CANCELADO', 'Cancelado')}</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('reports.select_priority', 'Prioridad:')}</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            >
              <option value="TODAS">{t('projects.all_priorities', 'Todas las Prioridades')}</option>
              <option value="CRITICA">{t('priority.CRITICA', 'Crítica')}</option>
              <option value="ALTA">{t('priority.ALTA', 'Alta')}</option>
              <option value="MEDIA">{t('priority.MEDIA', 'Media')}</option>
              <option value="BAJA">{t('priority.BAJA', 'Baja')}</option>
            </select>
          </div>

          {/* Dates */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('reports.date_from', 'Comienzo Desde:')}</label>
            <input
              type="date"
              value={startDateFrom}
              onChange={(e) => setStartDateFrom(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('reports.date_to', 'Culminación Hasta:')}</label>
            <input
              type="date"
              value={dueDateTo}
              onChange={(e) => setDueDateTo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* Overdue Checkbox */}
        <div className="pt-2 flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyOverdue}
              onChange={(e) => setOnlyOverdue(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              {t('reports.only_overdue', 'Filtrar exclusivamente tareas atrasadas')}
            </span>
          </label>
        </div>
      </div>

      {/* Report Generation Metadata Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>{t('reports.title', 'Reporte')} <strong className="text-slate-700 dark:text-slate-300">({formatDateTime(now)})</strong></span>
        </div>
        <div className="font-semibold text-indigo-600 dark:text-indigo-400">
          {filteredProjects.length} {t('teams.projects_label', 'proyectos')} • {filteredTasks.length} {t('teams.tasks_label', 'tareas')}
        </div>
      </div>

      {/* Visual Report Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            {t('charts.task_dist', 'Distribución de Tareas en el Reporte')}
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            {t('charts.task_dist_sub', 'Proporción de tareas según el estado en los registros seleccionados.')}
          </p>

          <div className="h-60 w-full flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-xs text-slate-400">{t('charts.no_tasks', 'Sin datos de tareas para graficar')}</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: unknown) => [`${Number(val)} ${t('charts.tasks', 'tareas')}`, t('charts.qty', 'Cantidad')]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Project Progress */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            {t('charts.proj_prog', 'Progreso General de Proyectos (%)')}
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            {t('charts.proj_prog_sub', 'Cálculo ponderado de tareas activas.')}
          </p>

          <div className="h-60 w-full">
            {barData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                {t('charts.no_projects', 'Sin proyectos que coincidan con los filtros')}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    formatter={(val: unknown) => [`${Number(val)}%`, t('charts.general_progress', 'Avance general')]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="progreso" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Projects Executive Summary Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {t('reports.summary_title', 'Resumen Ejecutivo de Proyectos Filtrados')} ({filteredProjects.length})
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredProjects.map((p) => {
            const pTasks = filteredTasks.filter((t) => t.projectId === p.id);
            const statusCfg = getProjectStatusConfig(p.status, t);

            return (
              <div key={p.id} className="py-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                      {p.code}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {p.title}
                    </h4>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${statusCfg.bg}`}>
                      {statusCfg.label}
                    </span>
                  </div>

                  <div className="w-40">
                    <div className="flex justify-between text-[11px] font-semibold mb-1">
                      <span className="text-slate-500">{t('tasks.col_progress', 'Avance')}</span>
                      <span className="font-mono">{p.calculatedProgress !== null ? `${p.calculatedProgress}%` : 'S/P'}</span>
                    </div>
                    <ProgressBar progress={p.calculatedProgress} size="sm" />
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {p.summary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-500 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{t('role.PROJECT_MANAGER', 'Project Manager')}:</span>{' '}
                    {p.manager?.fullName || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{t('dir.assistants_title', 'Asistentes')}:</span>{' '}
                    {p.assistants?.map((a) => a.user?.fullName).join(', ') || 'Ninguno'}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{t('pdetail.dates_info', 'Vigencia')}:</span>{' '}
                    {formatDate(p.startDate)} → {formatDate(p.targetDate)}
                  </div>
                </div>

                {/* Subtable of Tasks */}
                <div className="pt-2">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t('pdetail.tab_tasks', 'Tareas del Proyecto')} ({pTasks.length}):
                  </p>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        <tr>
                          <th className="py-2 px-3">{t('tasks.col_code', 'Código')}</th>
                          <th className="py-2 px-3">{t('tasks.col_task', 'Nombre')}</th>
                          <th className="py-2 px-3">{t('tasks.col_assignee', 'Responsable')}</th>
                          <th className="py-2 px-3">{t('tasks.col_status', 'Estado')}</th>
                          <th className="py-2 px-3">{t('tasks.col_progress', 'Avance')}</th>
                          <th className="py-2 px-3">{t('tasks.col_due', 'Culminación')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {pTasks.map((tItem) => {
                          const sCfg = getTaskStatusConfig(tItem.status, t);
                          return (
                            <tr key={tItem.id} className={tItem.isOverdue ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''}>
                              <td className="py-2 px-3 font-mono font-bold">{tItem.code}</td>
                              <td className="py-2 px-3 font-medium">{tItem.title}</td>
                              <td className="py-2 px-3">{tItem.assignee?.fullName || t('tasks.unassigned', 'Sin asignar')}</td>
                              <td className="py-2 px-3">
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${sCfg.bg}`}>
                                  {sCfg.label}
                                </span>
                              </td>
                              <td className="py-2 px-3 font-mono">{tItem.progress}%</td>
                              <td className={`py-2 px-3 ${tItem.isOverdue ? 'font-bold text-rose-600' : ''}`}>
                                {formatDate(tItem.dueDate)} {tItem.isOverdue && '(!)'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
