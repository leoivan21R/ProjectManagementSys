'use client';

import React, { useState } from 'react';
import { X, Send, MessageSquare, History, User } from 'lucide-react';
import { Task } from '@/lib/types';
import { useData } from '@/context/DataContext';
import { formatDateTime } from '@/lib/utils';
import Image from 'next/image';

interface TaskCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export function TaskCommentsModal({ isOpen, onClose, task }: TaskCommentsModalProps) {
  const { addComment, activityLogs, users } = useData();
  const [commentText, setCommentText] = useState('');
  const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !task) return null;

  const taskLogs = activityLogs.filter((l) => l.taskId === task.id);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      await addComment(task.id, commentText.trim());
      setCommentText('');
    } catch (error) {
      console.error('Error al añadir comentario:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded">
                {task.code}
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                {task.title}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Responsable: {task.assignee?.fullName || 'Sin asignar'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs: Comments vs History */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 bg-slate-50/30 dark:bg-slate-950/30">
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'comments'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Comentarios ({task.comments?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Historial de Cambios ({taskLogs.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'comments' ? (
            <>
              {(!task.comments || task.comments.length === 0) ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  No hay comentarios registrados para esta tarea. Sé el primero en comentar.
                </div>
              ) : (
                <div className="space-y-3">
                  {task.comments.map((comm) => {
                    const author = users.find((u) => u.id === comm.userId);
                    return (
                      <div
                        key={comm.id}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            {author?.avatarUrl ? (
                              <Image
                                src={author.avatarUrl}
                                alt={comm.authorName}
                                width={24}
                                height={24}
                                className="w-6 h-6 rounded-full object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                                <User className="w-3.5 h-3.5" />
                              </div>
                            )}
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {comm.authorName}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {formatDateTime(comm.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap pl-8">
                          {comm.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              {taskLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <History className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  No hay registros de cambios para esta tarea todavía.
                </div>
              ) : (
                <div className="space-y-3">
                  {taskLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                    >
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-slate-800 dark:text-slate-200 font-medium">
                          {log.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span>Por {log.userName}</span>
                          <span>•</span>
                          <span>{formatDateTime(log.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Comment Input Footer */}
        {activeTab === 'comments' && (
          <form
            onSubmit={handleSendComment}
            className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
          >
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Escribe un comentario o actualización..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSubmitting || !commentText.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-md shadow-indigo-600/25"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
