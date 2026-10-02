'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewProject: () => void;
}

export function MobileNav({ isOpen, onClose, onOpenNewProject }: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-72 bg-slate-900 z-10 shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <Sidebar
          onOpenNewProject={() => {
            onClose();
            onOpenNewProject();
          }}
          onNavigate={onClose}
          className="w-full h-full border-none"
        />
      </div>
    </div>
  );
}
