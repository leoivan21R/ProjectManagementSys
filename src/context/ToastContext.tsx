'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
}

interface ToastContextType {
  toast: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: ToastType, message: string, title?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastItem = { id, type, message, title };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message: string, title = 'Operación Exitosa') => addToast('success', message, title),
    error: (message: string, title = 'Error') => addToast('error', message, title),
    warning: (message: string, title = 'Advertencia') => addToast('warning', message, title),
    info: (message: string, title = 'Información') => addToast('info', message, title),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          let bg = 'bg-slate-900 text-white border-slate-800';
          let Icon = Info;
          let iconColor = 'text-sky-400';

          if (t.type === 'success') {
            bg = 'bg-emerald-950/95 text-emerald-100 border-emerald-800';
            Icon = CheckCircle2;
            iconColor = 'text-emerald-400';
          } else if (t.type === 'error') {
            bg = 'bg-rose-950/95 text-rose-100 border-rose-800';
            Icon = AlertCircle;
            iconColor = 'text-rose-400';
          } else if (t.type === 'warning') {
            bg = 'bg-amber-950/95 text-amber-100 border-amber-800';
            Icon = AlertTriangle;
            iconColor = 'text-amber-400';
          } else if (t.type === 'info') {
            bg = 'bg-sky-950/95 text-sky-100 border-sky-800';
            Icon = Info;
            iconColor = 'text-sky-400';
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${bg}`}
              role="alert"
            >
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 text-sm">
                {t.title && <p className="font-semibold">{t.title}</p>}
                <p className="opacity-90">{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="opacity-60 hover:opacity-100 transition-opacity p-1 text-white"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
