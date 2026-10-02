'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, FolderKanban, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { ProjectDirectionCard } from '@/components/projects/ProjectDirectionCard';

export default function DireccionPage() {
  const { projects } = useData();
  const { t } = useLanguage();
  const activeProjects = projects.filter((p) => !p.deletedAt);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <Compass className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          {t('dir.title', 'Dirección y Coordinación de Proyectos')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
          {t('dir.subtitle', 'Estructura jerárquica y operativa de liderazgo. Cada proyecto cuenta con un Project Manager responsable principal y uno o varios asistentes con responsabilidades delegadas.')}
        </p>
      </div>

      {/* Projects Leadership Cards */}
      <div className="space-y-6">
        {activeProjects.map((project) => (
          <div key={project.id} className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                  {project.code}
                </span>
                <Link
                  href={`/proyectos/${project.id}`}
                  className="text-base font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {project.title}
                </Link>
              </div>

              <Link
                href={`/proyectos/${project.id}`}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>{t('dir.view_project', 'Ver Proyecto')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <ProjectDirectionCard project={project} />
          </div>
        ))}
      </div>
    </div>
  );
}
