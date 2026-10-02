'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  Compass,
  Users,
  CheckSquare,
  BarChart3,
  Bell,
  Trash2,
  ShieldAlert,
  Settings,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';

import { Logo } from '@/components/common/Logo';

interface SidebarProps {
  onOpenNewProject: () => void;
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ onOpenNewProject, className = '', onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { notifications, tasks, resetDatabase } = useData();
  const { canCreateProject } = useAuth();
  const { t } = useLanguage();

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  // Deleted count for trash badge
  const deletedCount = tasks.filter((t) => t.deletedAt).length;

  const navItems = [
    { label: t('nav.dashboard', 'Dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { label: t('nav.projects', 'Proyectos'), href: '/proyectos', icon: FolderKanban },
    { label: t('nav.direction', 'Dirección y Coordinación'), href: '/direccion', icon: Compass },
    { label: t('nav.teams', 'Equipos'), href: '/equipos', icon: Users },
    { label: t('nav.tasks', 'Tareas'), href: '/tareas', icon: CheckSquare },
    { label: t('nav.reports', 'Reportes'), href: '/reportes', icon: BarChart3 },
    { label: t('nav.notifications', 'Notificaciones'), href: '/notificaciones', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined, badgeColor: 'bg-rose-500' },
    { label: t('nav.trash', 'Papelera'), href: '/papelera', icon: Trash2, badge: deletedCount > 0 ? deletedCount : undefined, badgeColor: 'bg-slate-500' },
    { label: t('nav.admin', 'Administración'), href: '/administracion', icon: ShieldAlert },
    { label: t('nav.settings', 'Configuración'), href: '/configuracion', icon: Settings },
  ];

  return (
    <aside className={`w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-800 ${className}`}>
      {/* Brand Header with AML Consultant Logo & Link */}
      <div className="p-4 border-b border-slate-800/80">
        <Logo variant="horizontal" size="md" />
      </div>

      {/* Action Button: Nuevo Proyecto */}
      <div className="p-4 border-b border-slate-800/40">
        <button
          onClick={() => {
            onOpenNewProject();
            if (onNavigate) onNavigate();
          }}
          disabled={!canCreateProject}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm shadow-md transition-all ${
            canCreateProject
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02]'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
          title={canCreateProject ? 'Crear un nuevo proyecto' : 'Tu perfil actual no tiene permisos para crear proyectos'}
        >
          <Plus className="w-4 h-4" />
          <span>{t('action.new_project', 'Nuevo Proyecto')}</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600/15 text-white font-semibold border border-indigo-500/30 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer System Quick Actions */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] text-slate-400 font-medium">Idioma:</span>
          <LanguageSwitcher variant="segmented" />
        </div>

        <button
          onClick={() => {
            if (confirm('¿Deseas restablecer todos los datos a la versión inicial de prueba?')) {
              resetDatabase();
            }
          }}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Restablecer base de datos demostrativa"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer Datos Demo</span>
        </button>
      </div>
    </aside>
  );
}
