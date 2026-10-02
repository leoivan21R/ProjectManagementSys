'use client';

import React, { useState } from 'react';
import { Menu, Search, Bell, Check, Clock, Trash2 } from 'lucide-react';
import { UserRoleSwitcher } from './UserRoleSwitcher';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';

interface NavbarProps {
  onOpenMobileNav: () => void;
  onOpenSearch: () => void;
}

export function Navbar({ onOpenMobileNav, onOpenSearch }: NavbarProps) {
  const { notifications, markNotificationRead, deleteNotification, clearAllNotifications } = useData();
  const { t } = useLanguage();
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.isRead);

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Mobile Menu & Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 transition-all text-xs sm:text-sm w-44 sm:w-72"
        >
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="truncate">{t('action.search', 'Buscar en el sistema...')}</span>
          <kbd className="hidden sm:inline-block ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Notificaciones"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          {showNotifMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifMenu(false)} />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Notificaciones</p>
                    {unreadNotifs.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                        {unreadNotifs.length} nuevas
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                      <button
                        onClick={async () => {
                          if (confirm('¿Borrar todas las notificaciones?')) {
                            await clearAllNotifications();
                          }
                        }}
                        className="text-[11px] text-rose-500 hover:text-rose-700 hover:underline"
                        title="Borrar todas las notificaciones"
                      >
                        Limpiar
                      </button>
                    )}
                    <Link
                      href="/notificaciones"
                      onClick={() => setShowNotifMenu(false)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Ver todas
                    </Link>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No hay notificaciones registradas.
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        className={`p-3.5 transition-colors ${n.isRead ? 'opacity-70 bg-transparent' : 'bg-indigo-50/40 dark:bg-indigo-950/20'}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{n.title}</p>
                          <div className="flex items-center gap-1">
                            {!n.isRead && (
                              <button
                                onClick={() => markNotificationRead(n.id)}
                                className="text-slate-400 hover:text-indigo-600 p-0.5"
                                title="Marcar como leída"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(n.id)}
                              className="text-slate-400 hover:text-rose-600 p-0.5"
                              title="Borrar notificación"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1.5">
                          <Clock className="w-3 h-3" />
                          <span>{formatDateTime(n.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Language Switcher (ES / EN) */}
        <LanguageSwitcher />

        {/* User Switcher / Simulator */}
        <UserRoleSwitcher />
      </div>
    </header>
  );
}
