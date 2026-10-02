'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Check,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatDateTime } from '@/lib/utils';
import { ConfirmModal } from '@/components/common/ConfirmModal';

export default function NotificacionesPage() {
  const { notifications, markNotificationRead, deleteNotification, clearAllNotifications } = useData();
  const { t } = useLanguage();
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [notifToDelete, setNotifToDelete] = useState<string | null>(null);

  const handleMarkAllRead = async () => {
    for (const n of notifications) {
      if (!n.isRead) {
        await markNotificationRead(n.id);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            {t('notif.title', 'Centro de Notificaciones y Alertas')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('notif.subtitle', 'Supervisa alertas automáticas de tareas atrasadas, vencimientos próximos y avisos de dirección.')}
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                title={t('action.mark_all_read', 'Marcar todas como leídas')}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{t('action.mark_all_read', 'Marcar todas como leídas')}</span>
              </button>
            )}

            <button
              onClick={() => setConfirmClearAll(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 hover:bg-rose-600 hover:text-white dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white text-xs font-semibold transition-all shadow-xs"
              title={t('action.clear_all', 'Borrar todas')}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('action.clear_all', 'Borrar todas')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Bell className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
              {t('notif.empty', 'No tienes notificaciones pendientes')}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {t('notif.empty_sub', 'Las alertas automáticas sobre tareas o proyectos se mostrarán aquí.')}
            </p>
          </div>
        ) : (
          notifications.map((notif) => {
            let Icon = Info;
            let iconColor = 'text-sky-500 bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800';
            if (notif.type === 'ALERT') {
              Icon = AlertCircle;
              iconColor = 'text-rose-500 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800';
            } else if (notif.type === 'WARNING') {
              Icon = AlertTriangle;
              iconColor = 'text-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800';
            } else if (notif.type === 'SUCCESS') {
              Icon = CheckCircle2;
              iconColor = 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';
            }

            return (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  notif.isRead
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-75'
                    : 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800/80 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl border flex-shrink-0 ${iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2">
                      {formatDateTime(notif.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {notif.link && (
                    <Link
                      href={notif.link}
                      className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
                    >
                      <span>{t('action.view', 'Ver')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  {!notif.isRead && (
                    <button
                      onClick={() => markNotificationRead(notif.id)}
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                      title={t('action.mark_all_read', 'Marcar como leída')}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}

                  {/* Individual Delete Notification Button */}
                  <button
                    onClick={() => setNotifToDelete(notif.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition-colors"
                    title={t('action.delete', 'Borrar notificación')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal to Clear All */}
      <ConfirmModal
        isOpen={confirmClearAll}
        title={t('notif.confirm_clear_all_title', '¿Borrar todas las notificaciones?')}
        message={t('notif.confirm_clear_all_msg', '¿Estás seguro de que deseas eliminar todas las notificaciones del sistema? Esta acción no se puede deshacer.')}
        confirmText={t('action.clear_all', 'Borrar Todas')}
        cancelText={t('action.cancel', 'Cancelar')}
        isDestructive={true}
        onConfirm={async () => {
          await clearAllNotifications();
          setConfirmClearAll(false);
        }}
        onCancel={() => setConfirmClearAll(false)}
      />

      {/* Confirmation Modal to Delete Single Notification */}
      <ConfirmModal
        isOpen={!!notifToDelete}
        title={t('notif.confirm_delete_title', '¿Borrar esta notificación?')}
        message={t('notif.confirm_delete_msg', '¿Deseas eliminar esta notificación permanentemente?')}
        confirmText={t('action.delete', 'Borrar')}
        cancelText={t('action.cancel', 'Cancelar')}
        isDestructive={true}
        onConfirm={async () => {
          if (notifToDelete) {
            await deleteNotification(notifToDelete);
            setNotifToDelete(null);
          }
        }}
        onCancel={() => setNotifToDelete(null)}
      />
    </div>
  );
}
