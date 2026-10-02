import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Project, Task } from '../types';
import { formatDate, formatDateTime, getTaskStatusConfig } from '../utils';

export function exportReportToPdf(params: {
  projects: Project[];
  tasks: Task[];
  reportTitle?: string;
  filterSummary?: string;
}) {
  const { projects, tasks, reportTitle = 'Reporte Ejecutivo de Gestión', filterSummary = 'Filtros: Todos' } = params;
  const now = new Date().toISOString();

  // Create PDF in landscape for clean tabular presentation
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // 1. BRAND HEADER BAR (Deep Indigo/Slate theme)
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, pageWidth, 54, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('AML CONSULTANT • PROJECT MANAGER SYSTEM (PMS)', 28, 34);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // Slate-300
  doc.text(`Generado el: ${formatDateTime(now)}`, pageWidth - 28, 34, { align: 'right' });

  // 2. REPORT TITLE & METADATA
  let yPos = 78;
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(reportTitle, 28, yPos);

  yPos += 16;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text(`Criterios aplicados: ${filterSummary}`, 28, yPos);

  // 3. KPI SUMMARY BOXES
  yPos += 20;
  const completedTasks = tasks.filter((t) => t.status === 'CONCLUIDO').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'EN_PROGRESO').length;
  const pendingTasks = tasks.filter((t) => t.status === 'PENDIENTE').length;
  const overdueTasks = tasks.filter((t) => t.isOverdue).length;

  const boxWidth = (pageWidth - 56 - 36) / 4;
  const boxHeight = 44;

  const kpis = [
    { title: 'Total Tareas', value: `${tasks.length}`, color: [79, 70, 229] }, // Indigo
    { title: 'Concluidas (100%)', value: `${completedTasks}`, color: [16, 185, 129] }, // Emerald
    { title: 'En Progreso', value: `${inProgressTasks}`, color: [2, 132, 199] }, // Sky
    { title: 'Atrasadas (!)', value: `${overdueTasks}`, color: [225, 29, 72] }, // Rose
  ];

  kpis.forEach((kpi, index) => {
    const x = 28 + index * (boxWidth + 12);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, yPos, boxWidth, boxHeight, 4, 4, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.title, x + 10, yPos + 15);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.value, x + 10, yPos + 34);
  });

  yPos += boxHeight + 20;

  // 4. PROJECTS RESUMEN TABLE
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Resumen de Proyectos Seleccionados', 28, yPos);
  yPos += 8;

  const projectsRows = projects.map((p) => [
    p.code,
    p.title,
    p.manager?.fullName || 'N/A',
    p.assistants?.map((a) => a.user?.fullName).join(', ') || 'Ninguno',
    p.status,
    p.calculatedProgress !== null ? `${p.calculatedProgress}%` : 'S/P',
    `${formatDate(p.startDate)} - ${formatDate(p.targetDate)}`,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Código', 'Título del Proyecto', 'Project Manager', 'Asistentes', 'Estado', 'Progreso', 'Vigencia']],
    body: projectsRows,
    theme: 'striped',
    headStyles: {
      fillColor: [51, 65, 85], // Slate-700
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8,
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 200 },
      2: { cellWidth: 100 },
      3: { cellWidth: 120 },
      4: { cellWidth: 75 },
      5: { cellWidth: 60, halign: 'center' },
      6: { cellWidth: 110 },
    },
  });

  // 5. DETAILED TASKS TABLE
  // @ts-expect-error - lastAutoTable is injected by jspdf-autotable
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 24 : yPos + 100;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Desglose de Tareas y Responsables', 28, finalY);

  const tasksRows = tasks.map((t) => {
    const statusCfg = getTaskStatusConfig(t.status);
    const overdueLabel = t.isOverdue ? ' [ATRASADA]' : '';
    return [
      t.code,
      t.title,
      t.project?.code || 'N/A',
      t.assignee?.fullName || 'Sin asignar',
      `${statusCfg.label}${overdueLabel}`,
      `${t.progress}%`,
      t.priority,
      formatDate(t.dueDate),
    ];
  });

  autoTable(doc, {
    startY: finalY + 8,
    head: [['Código', 'Nombre de la Tarea', 'Proyecto', 'Responsable', 'Estado', 'Avance', 'Prioridad', 'Límite']],
    body: tasksRows,
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229], // Indigo-600
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8,
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 65 },
      1: { cellWidth: 220 },
      2: { cellWidth: 75 },
      3: { cellWidth: 110 },
      4: { cellWidth: 95 },
      5: { cellWidth: 55, halign: 'center' },
      6: { cellWidth: 65 },
      7: { cellWidth: 70 },
    },
    didParseCell: (data) => {
      // Highlight overdue in red
      if (data.column.index === 4 && String(data.cell.raw).includes('[ATRASADA]')) {
        data.cell.styles.textColor = [225, 29, 72];
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text(
      `Project Manager System (PMS) • Reporte Oficial de Seguimiento • Página ${i} de ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 14,
      { align: 'center' }
    );
  }

  const filename = `PMS_Reporte_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
