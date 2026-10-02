'use client';

import React, { useState, useEffect } from 'react';
import { Search, FolderKanban, CheckSquare, Users, X, ArrowRight } from 'lucide-react';
import { useData } from '@/context/DataContext';
import Link from 'next/link';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const { projects, tasks, users } = useData();
  const [query, setQuery] = useState('');

  // Keyboard shortcut Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredProjects = q
    ? projects.filter(
        (p) =>
          !p.deletedAt &&
          (p.title.toLowerCase().includes(q) ||
            p.code.toLowerCase().includes(q) ||
            p.summary.toLowerCase().includes(q))
      ).slice(0, 4)
    : [];

  const filteredTasks = q
    ? tasks.filter(
        (t) =>
          !t.deletedAt &&
          (t.title.toLowerCase().includes(q) ||
            t.code.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q))
      ).slice(0, 5)
    : [];

  const filteredUsers = q
    ? users.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.jobTitle.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const hasResults = filteredProjects.length > 0 || filteredTasks.length > 0 || filteredUsers.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar proyectos, códigos, tareas, responsables..."
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-base focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-[65vh] overflow-y-auto space-y-4">
          {!q && (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm">Escribe palabras clave para buscar en todo el sistema.</p>
              <div className="flex justify-center gap-2 mt-3 text-xs text-slate-500">
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">Ej: Banca</span>
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">Ej: TSK-0102</span>
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">Ej: David Méndez</span>
              </div>
            </div>
          )}

          {q && !hasResults && (
            <div className="py-10 text-center text-slate-400">
              <p className="text-sm font-medium">No se encontraron resultados para &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-500 mt-1">Verifica la ortografía o intenta con otro término.</p>
            </div>
          )}

          {filteredProjects.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">
                <FolderKanban className="w-3.5 h-3.5 text-indigo-500" />
                <span>Proyectos ({filteredProjects.length})</span>
              </div>
              <div className="space-y-1">
                {filteredProjects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/proyectos/${p.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded">
                          {p.code}
                        </span>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {p.title}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{p.summary}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {filteredTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">
                <CheckSquare className="w-3.5 h-3.5 text-sky-500" />
                <span>Tareas ({filteredTasks.length})</span>
              </div>
              <div className="space-y-1">
                {filteredTasks.map((t) => (
                  <Link
                    key={t.id}
                    href={`/tareas?search=${encodeURIComponent(t.code)}`}
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-1.5 py-0.5 rounded">
                          {t.code}
                        </span>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-sky-600 transition-colors">
                          {t.title}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {t.project?.title || 'Proyecto'} • Resp: {t.assignee?.fullName || 'Sin asignar'}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {filteredUsers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                <span>Miembros de Equipo ({filteredUsers.length})</span>
              </div>
              <div className="space-y-1">
                {filteredUsers.map((u) => (
                  <Link
                    key={u.id}
                    href="/equipos"
                    onClick={onClose}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {u.fullName}
                      </p>
                      <p className="text-xs text-slate-500">{u.jobTitle} • {u.email}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
