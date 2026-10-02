'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, defaultText?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  es: {
    // Navigation (Sidebar & Navbar)
    'nav.dashboard': 'Dashboard',
    'nav.projects': 'Proyectos',
    'nav.direction': 'Dirección y Coordinación',
    'nav.teams': 'Equipos',
    'nav.tasks': 'Tareas',
    'nav.reports': 'Reportes',
    'nav.notifications': 'Notificaciones',
    'nav.trash': 'Papelera',
    'nav.admin': 'Administración',
    'nav.settings': 'Configuración',

    // Common Actions
    'action.new_project': 'Nuevo Proyecto',
    'action.add_task': 'Añadir Tarea',
    'action.add_member': 'Incorporar Miembro',
    'action.delete_member': 'Eliminar Miembro',
    'action.remove_from_project': 'Eliminar del proyecto',
    'action.change_photo': 'Cambiar Foto',
    'action.upload_photo': 'Subir Fotografía',
    'action.clear_all': 'Borrar todas',
    'action.mark_all_read': 'Marcar todas como leídas',
    'action.save': 'Guardar',
    'action.cancel': 'Cancelar',
    'action.delete': 'Eliminar',
    'action.restore': 'Restaurar',
    'action.edit': 'Editar',
    'action.view': 'Ver',
    'action.clean': 'Limpiar',
    'action.export_pdf': 'Exportar PDF',
    'action.export_excel': 'Exportar Excel',
    'action.search': 'Buscar en el sistema...',
    'action.filter': 'Filtrar',
    'action.all': 'Todos',

    // Statuses
    'status.PLANIFICACION': 'Planificación',
    'status.EN_PLANIFICACION': 'En Planificación',
    'status.EN_PROGRESO': 'En Progreso',
    'status.EN_PAUSA': 'En Pausa',
    'status.CONCLUIDO': 'Concluido',
    'status.CANCELADO': 'Cancelado',
    'status.PENDIENTE': 'Pendiente',

    // Priorities
    'priority.BAJA': 'Baja',
    'priority.MEDIA': 'Media',
    'priority.ALTA': 'Alta',
    'priority.CRITICA': 'Crítica',

    // Roles
    'role.ADMIN': 'Administrador',
    'role.PROJECT_MANAGER': 'Project Manager',
    'role.TEAM_MEMBER': 'Miembro del equipo',

    // Dashboard Banner
    'dashboard.welcome_badge': 'AML Consultant • Panel Ejecutivo',
    'dashboard.active_session': 'Sesión activa como:',
    'dashboard.title': 'Project Manager System (PMS)',
    'dashboard.subtitle': 'Plataforma centralizada para la administración de proyectos, dirección y coordinación, tareas interactivas, equipos multidisciplinarios y reportes ejecutivos.',
    'dashboard.kpi_section_title': 'Indicadores Clave de Desempeño (KPIs)',
    'dashboard.kpi_realtime': 'Actualización en tiempo real',
    'dashboard.charts_section_title': 'Métricas Visuales y Avance',
    'dashboard.charts_sub': 'Gráficos dinámicos con Recharts',
    'dashboard.generate_report': 'Generar Reporte',

    // KPI Cards
    'kpi.total_projects': 'Proyectos Totales',
    'kpi.active_projects': 'Proyectos Activos',
    'kpi.completed_projects': 'Proyectos Concluidos',
    'kpi.cancelled_projects': 'Proyectos Cancelados',
    'kpi.overdue_tasks': 'Tareas Atrasadas',
    'kpi.pending_tasks': 'Tareas Pendientes',
    'kpi.in_progress_tasks': 'Tareas En Progreso',
    'kpi.completed_tasks': 'Tareas Concluidas',
    'kpi.total_tasks': 'Total de Tareas',
    'kpi.avg_progress': 'Avance General',
    'kpi.active_talent': 'Talento Activo',
    'kpi.pending_review': 'En Revisión',
    'kpi.critical_priority': 'Prioridad Crítica',
    'kpi.sub_active_projects': 'de {total} proyectos totales',
    'kpi.sub_completed_projects': 'Entregados al 100%',
    'kpi.sub_cancelled_projects': 'Historial conservado',
    'kpi.sub_overdue_tasks': '¡Requieren atención inmediata!',
    'kpi.sub_pending_tasks': 'Sin iniciar (0% avance)',
    'kpi.sub_in_progress_tasks': 'En desarrollo activo',
    'kpi.sub_completed_tasks': 'Finalizadas satisfactoriamente',
    'kpi.sub_total_tasks': 'Distribuidas en el sistema',

    // Charts
    'charts.task_dist': 'Distribución de Tareas por Estado',
    'charts.task_dist_sub': 'Proporción en tiempo real según los colores oficiales del sistema.',
    'charts.no_tasks': 'Sin tareas registradas para graficar',
    'charts.proj_prog': 'Avance General por Proyecto (%)',
    'charts.proj_prog_sub': 'Promedio ponderado de tareas activas (excluyendo canceladas).',
    'charts.no_projects': 'Sin proyectos activos para comparar',
    'charts.tasks': 'tareas',
    'charts.qty': 'Cantidad',
    'charts.general_progress': 'Avance general',

    // Recent Projects (Dashboard)
    'projects.recent_title': 'Proyectos en Ejecución y Seguimiento',
    'projects.recent_sub': 'Supervisión integral de fechas, responsables y porcentaje de avance.',
    'projects.search_placeholder': 'Buscar por título, código o Project Manager...',
    'projects.tab_all': 'Todos',
    'projects.tab_active': 'Activos',
    'projects.tab_completed': 'Concluidos',
    'projects.tab_cancelled': 'Cancelados',
    'projects.empty_search': 'No se encontraron proyectos con los criterios de búsqueda actuales.',
    'projects.no_pm': 'Sin PM',
    'projects.est_end': 'Fecha estimada fin',
    'projects.gen_progress': 'Progreso general',
    'projects.tasks_completed_count': 'tareas ({count} concluidas)',
    'projects.view_detail': 'Ver detalle del proyecto',
    'projects.edit': 'Editar proyecto',
    'projects.move_to_trash': 'Mover a papelera',
    'projects.delete_modal_title': '¿Mover proyecto a la papelera?',
    'projects.delete_modal_msg': '¿Estás seguro de que deseas eliminar el proyecto "{title}" ({code})? Se trasladará a la papelera de recuperación.',
    'projects.move_trash_btn': 'Mover a Papelera',
    'projects.keep_btn': 'Conservar Proyecto',

    // Projects Catalog (Page)
    'projects.catalog_title': 'Catálogo de Proyectos',
    'projects.catalog_sub': 'Gestión integral, asignación de responsables, fechas de ejecución y seguimiento del progreso de AML Consultant.',
    'projects.all_statuses': 'Todos los Estados',
    'projects.all_priorities': 'Todas las Prioridades',
    'projects.created_label': 'Creado:',
    'projects.start_label': 'Inicio:',
    'projects.target_label': 'Fin:',
    'projects.archive_action': 'Archivar',
    'projects.unarchive_action': 'Desarchivar',
    'projects.archived_badge': 'Archivado',

    // Teams / Members Page
    'teams.title': 'Administración de Equipos y Miembros',
    'teams.subtitle': 'Directorio corporativo de talento de AML Consultant. Visualiza proyectos, tareas asignadas, gestiona fotos de perfil e incorpora o elimina miembros del equipo.',
    'teams.search_placeholder': 'Buscar por nombre, correo, cargo o departamento...',
    'teams.all_profiles': 'Todos los Perfiles',
    'teams.projects_label': 'Proyectos',
    'teams.tasks_label': 'Tareas',
    'teams.participates_in': 'Participa en:',
    'teams.member_management': 'Gestión de miembro:',
    'teams.overdue_alert': 'Tiene tarea(s) atrasadas',
    'teams.photo_upload_title': 'Fotografía del Miembro',
    'teams.photo_upload_help': 'Sube un archivo de imagen (PNG, JPG, WEBP) o escribe una URL directa.',
    'teams.drop_or_click': 'Haz clic para seleccionar o arrastra una foto aquí',
    'teams.or_url': 'O ingresa la URL directa de la imagen:',
    'teams.remove_photo': 'Quitar foto',
    'teams.edit_data': 'Editar Datos',

    // Direction & Coordination Page & Card
    'dir.title': 'Dirección y Coordinación de Proyectos',
    'dir.subtitle': 'Estructura jerárquica y operativa de liderazgo. Cada proyecto cuenta con un Project Manager responsable principal y uno o varios asistentes con responsabilidades delegadas.',
    'dir.card_title': 'Dirección y Coordinación del Proyecto',
    'dir.card_sub': 'Estructura de liderazgo, Project Manager principal y asistentes con delegación operativa.',
    'dir.view_project': 'Ver Proyecto',
    'dir.pm_title': 'Project Manager Responsable Principal',
    'dir.pm_badge': 'Líder Principal',
    'dir.no_pm': 'No se ha designado un Project Manager aún.',
    'dir.assistants_title': 'Asistentes y Coordinadores Delegados',
    'dir.no_assistants': 'No se han asignado asistentes a este proyecto.',
    'dir.add_assistant': '+ Añadir Asistente',
    'dir.assign_assistant_title': 'Asignar Asistente al Proyecto',
    'dir.select_user': 'Seleccionar colaborador:',
    'dir.resp_label': 'Responsabilidad delegada:',
    'dir.resp_placeholder': 'Ej: Supervisión de QA y Entregables',
    'dir.assign_btn': 'Asignar Asistente',
    'dir.confirm_remove': '¿Deseas remover este asistente del proyecto?',

    // Tasks Page & Table
    'tasks.title': 'Administración Global de Tareas',
    'tasks.sub': 'Tabla interactiva con los 11 campos requeridos, avance porcentual, automatismos de estado, identificación de tareas atrasadas y seguimiento por correo electrónico.',
    'tasks.new_task': 'Nueva Tarea',
    'tasks.all_projects': 'Todos los Proyectos',
    'tasks.all_assignees': 'Todos los Asignados',
    'tasks.only_overdue': 'Solo Atrasadas',
    'tasks.search_ph': 'Buscar por título, código, descripción o responsable...',
    'tasks.col_code': 'Código',
    'tasks.col_task': 'Tarea',
    'tasks.col_project': 'Proyecto',
    'tasks.col_assignee': 'Responsable',
    'tasks.col_priority': 'Prioridad',
    'tasks.col_status': 'Estado',
    'tasks.col_due': 'Vencimiento',
    'tasks.col_progress': 'Avance',
    'tasks.col_actions': 'Acciones',
    'tasks.col_desc': 'Descripción',
    'tasks.col_start': 'Comienzo',
    'tasks.comments': 'Comentarios',
    'tasks.view_comments': 'Ver y añadir comentarios',
    'tasks.email_followup': 'Enviar seguimiento por correo',
    'tasks.unassigned': 'Sin Asignar',
    'tasks.no_desc': 'Sin descripción',
    'tasks.delete_modal_title': '¿Mover tarea a la papelera?',
    'tasks.delete_modal_msg': '¿Estás seguro de que deseas eliminar la tarea "{title}" ({code})? Se trasladará a la papelera de recuperación, donde podrás restaurarla o eliminarla definitivamente.',
    'tasks.keep_task_btn': 'Conservar Tarea',
    'tasks.progress_percent': '{p}% avance',

    // Reports Page
    'reports.title': 'Reportes Ejecutivos y Exportación',
    'reports.sub': 'Genera informes detallados y parametrizados en formatos oficiales PDF y Excel para la toma de decisiones.',
    'reports.filters_title': 'Configuración de Filtros Paramétricos',
    'reports.export_pdf': 'Descargar Reporte PDF',
    'reports.export_excel': 'Descargar Reporte Excel',
    'reports.select_project': 'Proyecto:',
    'reports.select_pm': 'Project Manager:',
    'reports.select_assistant': 'Asistente:',
    'reports.select_assignee': 'Responsable de Tarea:',
    'reports.select_status': 'Estado de Tarea:',
    'reports.select_priority': 'Prioridad:',
    'reports.date_from': 'Desde fecha:',
    'reports.date_to': 'Hasta fecha:',
    'reports.only_overdue': 'Solo tareas atrasadas',
    'reports.reset_filters': 'Restablecer Filtros',
    'reports.summary_title': 'Resumen Ejecutivo de Resultados',
    'reports.matching_projects': 'Proyectos Coincidentes',
    'reports.matching_tasks': 'Tareas Coincidentes',

    // Project Detail Page
    'pdetail.tab_tasks': 'Tareas del Proyecto',
    'pdetail.tab_direction': 'Dirección y Coordinación',
    'pdetail.tab_team': 'Equipo de Trabajo',
    'pdetail.tab_activity': 'Historial de Actividades',
    'pdetail.back': 'Volver al catálogo',
    'pdetail.objectives': 'Objetivos del Proyecto',
    'pdetail.dates_info': 'Cronograma y Plazos',
    'pdetail.add_task': '+ Añadir Tarea',
    'pdetail.add_team_member': '+ Incorporar Miembro',

    // Notifications Page
    'notif.title': 'Centro de Notificaciones y Alertas',
    'notif.subtitle': 'Supervisa alertas automáticas de tareas atrasadas, vencimientos próximos y avisos de dirección.',
    'notif.empty': 'No tienes notificaciones pendientes',
    'notif.empty_sub': 'Las alertas automáticas sobre tareas o proyectos se mostrarán aquí.',
    'notif.confirm_clear_all_title': '¿Borrar todas las notificaciones?',
    'notif.confirm_clear_all_msg': '¿Estás seguro de que deseas eliminar todas las notificaciones del sistema? Esta acción no se puede deshacer.',
    'notif.confirm_delete_title': '¿Borrar esta notificación?',
    'notif.confirm_delete_msg': '¿Deseas eliminar esta notificación permanentemente?',

    // Language
    'lang.spanish': 'Español',
    'lang.english': 'Inglés',
    'lang.switch': 'Cambiar idioma',
  },
  en: {
    // Navigation (Sidebar & Navbar)
    'nav.dashboard': 'Dashboard',
    'nav.projects': 'Projects',
    'nav.direction': 'Direction & Coordination',
    'nav.teams': 'Teams & Members',
    'nav.tasks': 'Tasks',
    'nav.reports': 'Reports',
    'nav.notifications': 'Notifications',
    'nav.trash': 'Trash Bin',
    'nav.admin': 'Administration',
    'nav.settings': 'Settings',

    // Common Actions
    'action.new_project': 'New Project',
    'action.add_task': 'Add Task',
    'action.add_member': 'Add Member',
    'action.delete_member': 'Delete Member',
    'action.remove_from_project': 'Remove from project',
    'action.change_photo': 'Change Photo',
    'action.upload_photo': 'Upload Photo',
    'action.clear_all': 'Clear All',
    'action.mark_all_read': 'Mark all as read',
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.delete': 'Delete',
    'action.restore': 'Restore',
    'action.edit': 'Edit',
    'action.view': 'View',
    'action.clean': 'Clear',
    'action.export_pdf': 'Export PDF',
    'action.export_excel': 'Export Excel',
    'action.search': 'Search system...',
    'action.filter': 'Filter',
    'action.all': 'All',

    // Statuses
    'status.PLANIFICACION': 'Planning',
    'status.EN_PLANIFICACION': 'Planning',
    'status.EN_PROGRESO': 'In Progress',
    'status.EN_PAUSA': 'On Hold',
    'status.CONCLUIDO': 'Completed',
    'status.CANCELADO': 'Cancelled',
    'status.PENDIENTE': 'Pending',

    // Priorities
    'priority.BAJA': 'Low',
    'priority.MEDIA': 'Medium',
    'priority.ALTA': 'High',
    'priority.CRITICA': 'Critical',

    // Roles
    'role.ADMIN': 'Administrator',
    'role.PROJECT_MANAGER': 'Project Manager',
    'role.TEAM_MEMBER': 'Team Member',

    // Dashboard Banner
    'dashboard.welcome_badge': 'AML Consultant • Executive Panel',
    'dashboard.active_session': 'Active session as:',
    'dashboard.title': 'Project Manager System (PMS)',
    'dashboard.subtitle': 'Centralized platform for project management, direction and coordination, interactive tasks, multidisciplinary teams, and executive reporting.',
    'dashboard.kpi_section_title': 'Key Performance Indicators (KPIs)',
    'dashboard.kpi_realtime': 'Real-time updates',
    'dashboard.charts_section_title': 'Visual Metrics & Progress',
    'dashboard.charts_sub': 'Dynamic charts with Recharts',
    'dashboard.generate_report': 'Generate Report',

    // KPI Cards
    'kpi.total_projects': 'Total Projects',
    'kpi.active_projects': 'Active Projects',
    'kpi.completed_projects': 'Completed Projects',
    'kpi.cancelled_projects': 'Cancelled Projects',
    'kpi.overdue_tasks': 'Overdue Tasks',
    'kpi.pending_tasks': 'Pending Tasks',
    'kpi.in_progress_tasks': 'In Progress Tasks',
    'kpi.completed_tasks': 'Completed Tasks',
    'kpi.total_tasks': 'Total Tasks',
    'kpi.avg_progress': 'Average Progress',
    'kpi.active_talent': 'Active Talent',
    'kpi.pending_review': 'Under Review',
    'kpi.critical_priority': 'Critical Priority',
    'kpi.sub_active_projects': 'of {total} total projects',
    'kpi.sub_completed_projects': '100% Delivered',
    'kpi.sub_cancelled_projects': 'Preserved history',
    'kpi.sub_overdue_tasks': 'Require immediate attention!',
    'kpi.sub_pending_tasks': 'Not started (0% progress)',
    'kpi.sub_in_progress_tasks': 'In active development',
    'kpi.sub_completed_tasks': 'Completed successfully',
    'kpi.sub_total_tasks': 'Distributed across system',

    // Charts
    'charts.task_dist': 'Task Status Distribution',
    'charts.task_dist_sub': 'Real-time proportion according to official system colors.',
    'charts.no_tasks': 'No tasks registered to display',
    'charts.proj_prog': 'Overall Project Progress (%)',
    'charts.proj_prog_sub': 'Weighted average of active tasks (excluding cancelled).',
    'charts.no_projects': 'No active projects to compare',
    'charts.tasks': 'tasks',
    'charts.qty': 'Quantity',
    'charts.general_progress': 'Overall progress',

    // Recent Projects (Dashboard)
    'projects.recent_title': 'Ongoing Projects & Tracking',
    'projects.recent_sub': 'Comprehensive monitoring of dates, leaders, and progress percentage.',
    'projects.search_placeholder': 'Search by title, code or Project Manager...',
    'projects.tab_all': 'All',
    'projects.tab_active': 'Active',
    'projects.tab_completed': 'Completed',
    'projects.tab_cancelled': 'Cancelled',
    'projects.empty_search': 'No projects found with current search criteria.',
    'projects.no_pm': 'No PM',
    'projects.est_end': 'Estimated end date',
    'projects.gen_progress': 'Overall progress',
    'projects.tasks_completed_count': 'tasks ({count} completed)',
    'projects.view_detail': 'View project details',
    'projects.edit': 'Edit project',
    'projects.move_to_trash': 'Move to trash',
    'projects.delete_modal_title': 'Move project to trash?',
    'projects.delete_modal_msg': 'Are you sure you want to delete project "{title}" ({code})? It will be moved to the trash bin.',
    'projects.move_trash_btn': 'Move to Trash',
    'projects.keep_btn': 'Keep Project',

    // Projects Catalog (Page)
    'projects.catalog_title': 'Projects Catalog',
    'projects.catalog_sub': 'Comprehensive management, assignment of leaders, execution dates, and progress tracking for AML Consultant.',
    'projects.all_statuses': 'All Statuses',
    'projects.all_priorities': 'All Priorities',
    'projects.created_label': 'Created:',
    'projects.start_label': 'Start:',
    'projects.target_label': 'End:',
    'projects.archive_action': 'Archive',
    'projects.unarchive_action': 'Unarchive',
    'projects.archived_badge': 'Archived',

    // Teams / Members Page
    'teams.title': 'Teams & Members Administration',
    'teams.subtitle': 'AML Consultant talent directory. View projects, assigned tasks, manage profile photos, and onboard or delete team members.',
    'teams.search_placeholder': 'Search by name, email, job title or department...',
    'teams.all_profiles': 'All Profiles',
    'teams.projects_label': 'Projects',
    'teams.tasks_label': 'Tasks',
    'teams.participates_in': 'Participates in:',
    'teams.member_management': 'Member management:',
    'teams.overdue_alert': 'Has overdue task(s)',
    'teams.photo_upload_title': 'Member Photo',
    'teams.photo_upload_help': 'Upload an image file (PNG, JPG, WEBP) or enter a direct image URL.',
    'teams.drop_or_click': 'Click to select or drag a photo here',
    'teams.or_url': 'Or enter direct image URL:',
    'teams.remove_photo': 'Remove photo',
    'teams.edit_data': 'Edit Info',

    // Direction & Coordination Page & Card
    'dir.title': 'Project Direction & Coordination',
    'dir.subtitle': 'Hierarchical and operational leadership framework. Each project features a designated Project Manager and delegated assistants.',
    'dir.card_title': 'Project Direction & Coordination',
    'dir.card_sub': 'Leadership structure, primary Project Manager, and assistants with delegated operations.',
    'dir.view_project': 'View Project',
    'dir.pm_title': 'Primary Responsible Project Manager',
    'dir.pm_badge': 'Primary Leader',
    'dir.no_pm': 'No Project Manager designated yet.',
    'dir.assistants_title': 'Delegated Assistants & Coordinators',
    'dir.no_assistants': 'No assistants assigned to this project.',
    'dir.add_assistant': '+ Add Assistant',
    'dir.assign_assistant_title': 'Assign Assistant to Project',
    'dir.select_user': 'Select team member:',
    'dir.resp_label': 'Delegated responsibility:',
    'dir.resp_placeholder': 'E.g.: QA & Deliverables Supervision',
    'dir.assign_btn': 'Assign Assistant',
    'dir.confirm_remove': 'Do you want to remove this assistant from the project?',

    // Tasks Page & Table
    'tasks.title': 'Global Task Management',
    'tasks.sub': 'Interactive table with all 11 required fields, progress percentage, automated statuses, overdue task detection, and email tracking.',
    'tasks.new_task': 'New Task',
    'tasks.all_projects': 'All Projects',
    'tasks.all_assignees': 'All Assignees',
    'tasks.only_overdue': 'Only Overdue',
    'tasks.search_ph': 'Search by title, code, description or assignee...',
    'tasks.col_code': 'Code',
    'tasks.col_task': 'Task',
    'tasks.col_project': 'Project',
    'tasks.col_assignee': 'Assignee',
    'tasks.col_priority': 'Priority',
    'tasks.col_status': 'Status',
    'tasks.col_due': 'Due Date',
    'tasks.col_progress': 'Progress',
    'tasks.col_actions': 'Actions',
    'tasks.col_desc': 'Description',
    'tasks.col_start': 'Start Date',
    'tasks.comments': 'Comments',
    'tasks.view_comments': 'View and add comments',
    'tasks.email_followup': 'Send email follow-up',
    'tasks.unassigned': 'Unassigned',
    'tasks.no_desc': 'No description',
    'tasks.delete_modal_title': 'Move task to trash?',
    'tasks.delete_modal_msg': 'Are you sure you want to delete task "{title}" ({code})? It will be moved to the trash bin, where you can restore it or permanently delete it.',
    'tasks.keep_task_btn': 'Keep Task',
    'tasks.progress_percent': '{p}% progress',

    // Reports Page
    'reports.title': 'Executive Reports & Export',
    'reports.sub': 'Generate detailed parameterized reports in official PDF and Excel formats for executive decision-making.',
    'reports.filters_title': 'Parametric Filters Configuration',
    'reports.export_pdf': 'Download PDF Report',
    'reports.export_excel': 'Download Excel Report',
    'reports.select_project': 'Project:',
    'reports.select_pm': 'Project Manager:',
    'reports.select_assistant': 'Assistant:',
    'reports.select_assignee': 'Task Assignee:',
    'reports.select_status': 'Task Status:',
    'reports.select_priority': 'Priority:',
    'reports.date_from': 'From date:',
    'reports.date_to': 'To date:',
    'reports.only_overdue': 'Only overdue tasks',
    'reports.reset_filters': 'Reset Filters',
    'reports.summary_title': 'Executive Results Summary',
    'reports.matching_projects': 'Matching Projects',
    'reports.matching_tasks': 'Matching Tasks',

    // Project Detail Page
    'pdetail.tab_tasks': 'Project Tasks',
    'pdetail.tab_direction': 'Direction & Coordination',
    'pdetail.tab_team': 'Work Team',
    'pdetail.tab_activity': 'Activity Log',
    'pdetail.back': 'Back to catalog',
    'pdetail.objectives': 'Project Objectives',
    'pdetail.dates_info': 'Timeline & Deadlines',
    'pdetail.add_task': '+ Add Task',
    'pdetail.add_team_member': '+ Add Team Member',

    // Notifications Page
    'notif.title': 'Notifications & Alerts Center',
    'notif.subtitle': 'Monitor automatic alerts for overdue tasks, upcoming deadlines, and management notices.',
    'notif.empty': 'No pending notifications',
    'notif.empty_sub': 'Automatic alerts regarding tasks or projects will appear here.',
    'notif.confirm_clear_all_title': 'Delete all notifications?',
    'notif.confirm_clear_all_msg': 'Are you sure you want to delete all system notifications? This action cannot be undone.',
    'notif.confirm_delete_title': 'Delete this notification?',
    'notif.confirm_delete_msg': 'Do you want to permanently delete this notification?',

    // Language
    'lang.spanish': 'Spanish',
    'lang.english': 'English',
    'lang.switch': 'Switch language',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es');

  useEffect(() => {
    const saved = localStorage.getItem('pms_language') as Language;
    if (saved === 'es' || saved === 'en') {
      setLanguageState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('pms_language', lang);
    document.documentElement.lang = lang;
  };

  const toggleLanguage = () => {
    const next = language === 'es' ? 'en' : 'es';
    setLanguage(next);
  };

  const t = (key: string, defaultText?: string): string => {
    const dict = translations[language];
    if (dict && dict[key]) {
      return dict[key];
    }
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
