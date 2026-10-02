'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'segmented' | 'compact' | 'dropdown';
}

export function LanguageSwitcher({ className = '', variant = 'segmented' }: LanguageSwitcherProps) {
  const { language, setLanguage, toggleLanguage } = useLanguage();

  if (variant === 'compact') {
    return (
      <button
        onClick={toggleLanguage}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xs ${className}`}
        title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
      >
        <span className="text-sm leading-none">{language === 'es' ? '🇪🇸' : '🇺🇸'}</span>
        <span className="font-mono text-[11px] font-bold">{language.toUpperCase()}</span>
      </button>
    );
  }

  // Segmented switch (default)
  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/90 shadow-xs ${className}`}
      role="group"
      aria-label="Selector de Idioma / Language Selector"
    >
      <button
        type="button"
        onClick={() => setLanguage('es')}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${
          language === 'es'
            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
        title="Cambiar a Español"
      >
        <span className="text-xs leading-none">🇪🇸</span>
        <span className="text-[11px]">ES</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ${
          language === 'en'
            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`}
        title="Switch to English"
      >
        <span className="text-xs leading-none">🇺🇸</span>
        <span className="text-[11px]">EN</span>
      </button>
    </div>
  );
}
