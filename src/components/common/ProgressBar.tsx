'use client';

import React from 'react';
import { TaskStatus } from '@/lib/types';
import { getTaskStatusConfig } from '@/lib/utils';

interface ProgressBarProps {
  progress: number | null | undefined;
  status?: TaskStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ progress, status, size = 'md', showLabel = false, className = '' }: ProgressBarProps) {
  if (progress === null || progress === undefined) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
          <div className="bg-slate-300 dark:bg-slate-700 h-2 rounded-full w-0" />
        </div>
        {showLabel && <span className="text-xs text-slate-400 whitespace-nowrap">Sin datos</span>}
      </div>
    );
  }

  const clamped = Math.min(100, Math.max(0, progress));

  // Determine bar color based on status or progress percentage
  let barColor = 'bg-blue-600';
  if (status) {
    barColor = getTaskStatusConfig(status).progressBarBg;
  } else {
    if (clamped === 100) barColor = 'bg-emerald-500';
    else if (clamped >= 70) barColor = 'bg-blue-600';
    else if (clamped >= 30) barColor = 'bg-indigo-500';
    else barColor = 'bg-slate-400';
  }

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  return (
    <div className={`flex items-center gap-2.5 w-full ${className}`}>
      <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${heightClasses[size]} p-0.5 border border-slate-200/60 dark:border-slate-700/60`}>
        <div
          className={`${barColor} ${heightClasses[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-[36px] text-right">
          {clamped}%
        </span>
      )}
    </div>
  );
}
