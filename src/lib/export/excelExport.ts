import * as XLSX from 'xlsx';
import { Project, Task } from '../types';
import { formatDate, formatDateTime, getTaskStatusConfig } from '../utils';

export function exportReportToExcel(params: {
  projects: Project[];
  tasks: Task[];
  reportTitle?: string;
  filterSummary?: string;
}) {
  const { projects, tasks, reportTitle = 'Reporte Ejecutivo General', filterSummary = 'Todos los filtros aplicados' } = params;
  const now = new Date().toISOString();

  const workbook = XLSX.utils.book_new();

  // SHEET 1: RESUMEN EJECUTIVO
  const summaryData = [
    ['AML CONSULTANT • PROJECT MANAGER SYSTEM (PMS) - REPORTE EJECUTIVO'],
    ['Título del Reporte:', reportTitle],
    ['Fecha de Generación:', formatDateTime(now)],
    ['Filtros Aplicados:', filterSummary],
    [],
    ['MÉTRICAS Y TOTALES DEL SISTEMA'],
    ['Total de Proyectos Analizados:', projects.length],
    ['Proyectos en Progreso:', projects.filter((p) => p.status === 'EN_PROGRESO').length],
    ['Proyectos Concluidos:', projects.filter((p) => p.status === 'CONCLUIDO').length],
    ['Total de Tareas Analizadas:', tasks.length],
    ['Tareas Concluidas:', tasks.filter((t) => t.status === 'CONCLUIDO').length],
    ['Tareas En Progreso:', tasks.filter((t) => t.status === 'EN_PROGRESO').length],
    ['Tareas Pendientes:', tasks.filter((t) => t.status === 'PENDIENTE').length],
    ['Tareas Atrasadas (!):', tasks.filter((t) => t.isOverdue).length],
    [],
    ['NOTAS METODOLÓGICAS'],
    ['* El cálculo de avance general excluye tareas en estado Cancelado.'],
    ['* Una tarea se considera atrasada cuando su fecha estimada de culminación ha vencido y no está concluida ni cancelada.'],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen Ejecutivo');

  // SHEET 2: DETALLE DE TAREAS
  const tasksTableData = tasks.map((t) => {
    const statusCfg = getTaskStatusConfig(t.status);
    return {
      'Código Tarea': t.code,
      'Proyecto': t.project?.title || 'N/A',
      'Código Proyecto': t.project?.code || 'N/A',
      'Nombre de la Tarea': t.title,
      'Descripción': t.description,
      'Responsable': t.assignee?.fullName || 'Sin Asignar',
      'Correo Responsable': t.assignee?.email || 'N/A',
      'Estado': statusCfg.label,
      'Avance (%)': t.progress,
      'Prioridad': t.priority,
      'Fecha Inicio': formatDate(t.startDate),
      'Fecha Estimada Fin': formatDate(t.dueDate),
      '¿Atrasada?': t.isOverdue ? 'SÍ (ATRASADA)' : 'Al día',
      'Comentarios': t.commentsCount || 0,
    };
  });

  const tasksSheet = XLSX.utils.json_to_sheet(tasksTableData);
  XLSX.utils.book_append_sheet(workbook, tasksSheet, 'Listado de Tareas');

  // SHEET 3: DETALLE DE PROYECTOS
  const projectsTableData = projects.map((p) => {
    return {
      'Código': p.code,
      'Título': p.title,
      'Project Manager': p.manager?.fullName || 'N/A',
      'Correo PM': p.manager?.email || 'N/A',
      'Asistentes': p.assistants?.map((a) => `${a.user?.fullName} (${a.responsibility})`).join('; ') || 'Ninguno',
      'Estado': p.status,
      'Prioridad': p.priority,
      'Progreso Calculado (%)': p.calculatedProgress !== null ? `${p.calculatedProgress}%` : 'Sin tareas activas',
      'Total Tareas': p.tasksCount || 0,
      'Tareas Concluidas': p.completedTasksCount || 0,
      'Fecha Inicio': formatDate(p.startDate),
      'Fecha Estimada Culminación': formatDate(p.targetDate),
    };
  });

  const projectsSheet = XLSX.utils.json_to_sheet(projectsTableData);
  XLSX.utils.book_append_sheet(workbook, projectsSheet, 'Proyectos');

  // Trigger browser download
  const filename = `PMS_Reporte_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, filename);
}
