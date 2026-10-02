'use client';

import React, { useState } from 'react';
import { KpiCards } from '@/components/dashboard/KpiCards';
import { StatusCharts } from '@/components/dashboard/StatusCharts';
import { RecentProjects } from '@/components/dashboard/RecentProjects';
import { ProjectModal } from '@/components/projects/ProjectModal';
import { Project } from '@/lib/types';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const handleOpenNewProject = () => {
    setProjectToEdit(null);
    setProjectModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setProjectToEdit(project);
    setProjectModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <a
              href="https://www.amlconsultant.com"
              target="_blank"
              rel="noopener noreferrer"
              title="Visitar www.amlconsultant.com"
              className="px-3.5 py-2.5 rounded-2xl bg-white shadow-lg border border-white/20 hidden sm:flex items-center justify-center hover:scale-105 transition-all flex-shrink-0"
            >
              <img
                src="/logo.png"
                alt="AML Consultant"
                className="h-10 w-auto object-contain"
              />
            </a>
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <a
                  href="https://www.amlconsultant.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 hover:bg-indigo-500/50 hover:text-white transition-all"
                  title="Visitar sitio corporativo de AML Consultant"
                >
                  <Sparkles className="w-3 h-3 text-indigo-300" />
                  AML Consultant • www.amlconsultant.com
                </a>
                <span className="text-xs text-slate-300">• {t('dashboard.active_session', 'Sesión activa como:')}</span>
                <span className="text-xs font-semibold text-white underline decoration-indigo-400">
                  {currentUser.fullName} ({t(`role.${currentUser.role}`, currentUser.role)})
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {t('dashboard.title', 'Project Manager System (PMS)')}
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200/90 mt-1 max-w-2xl leading-relaxed">
                {t('dashboard.subtitle', 'Plataforma centralizada para la administración de proyectos, dirección y coordinación, tareas interactivas, equipos multidisciplinarios y reportes ejecutivos.')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/reportes"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all border border-white/20 flex items-center gap-1.5"
            >
              <span>{t('dashboard.generate_report', 'Generar Reporte')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 1. KPIs Section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            {t('dashboard.kpi_section_title', 'Indicadores Clave de Desempeño (KPIs)')}
          </h2>
          <span className="text-xs text-slate-500">{t('dashboard.kpi_realtime', 'Actualización en tiempo real')}</span>
        </div>
        <KpiCards />
      </section>

      {/* 2. Interactive Charts Section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            {t('dashboard.charts_section_title', 'Métricas Visuales y Avance')}
          </h2>
          <span className="text-xs text-slate-500">{t('dashboard.charts_sub', 'Gráficos dinámicos con Recharts')}</span>
        </div>
        <StatusCharts />
      </section>

      {/* 3. Existing Projects List Section */}
      <section>
        <RecentProjects
          onOpenNewProject={handleOpenNewProject}
          onEditProject={handleEditProject}
        />
      </section>

      {/* Project Modal */}
      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => {
          setProjectModalOpen(false);
          setProjectToEdit(null);
        }}
        projectToEdit={projectToEdit}
      />
    </div>
  );
}
