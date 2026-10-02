'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Globe } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  showWebsiteLink?: boolean;
  variant?: 'horizontal' | 'compact' | 'badge';
}

export function Logo({
  className = '',
  size = 'md',
  showSubtitle = true,
  showWebsiteLink = true,
  variant = 'horizontal',
}: LogoProps) {
  if (variant === 'badge') {
    return (
      <a
        href="https://www.amlconsultant.com"
        target="_blank"
        rel="noopener noreferrer"
        title="Visitar AML Consultant (www.amlconsultant.com)"
        className={`px-3 py-1.5 rounded-xl bg-white shadow-sm border border-slate-200/80 flex items-center justify-center hover:shadow-md transition-all ${className}`}
      >
        <Image
          src="/logo.png"
          alt="AML Consultant"
          width={80}
          height={32}
          className="h-7 w-auto object-contain"
          priority
        />
      </a>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <a
          href="https://www.amlconsultant.com"
          target="_blank"
          rel="noopener noreferrer"
          title="Visitar AML Consultant"
          className="px-2 py-1.5 rounded-xl bg-white shadow-sm border border-slate-200/80 flex items-center justify-center hover:scale-105 transition-all mb-1.5"
        >
          <Image
            src="/logo.png"
            alt="AML Consultant"
            width={70}
            height={28}
            className="h-6 w-auto object-contain"
            priority
          />
        </a>
        <span className="font-extrabold text-xs text-white tracking-wider">AML</span>
        <a
          href="https://www.amlconsultant.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-indigo-400 hover:underline flex items-center gap-0.5 mt-0.5"
        >
          <span>amlconsultant.com</span>
        </a>
      </div>
    );
  }

  // Default: 'horizontal'
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo image with high-contrast background and direct link to website */}
      <a
        href="https://www.amlconsultant.com"
        target="_blank"
        rel="noopener noreferrer"
        title="Visitar AML Consultant (www.amlconsultant.com)"
        className="px-2.5 py-1.5 rounded-xl bg-white shadow-md border border-slate-200/80 flex items-center justify-center flex-shrink-0 hover:shadow-lg hover:scale-105 transition-all group"
      >
        <Image
          src="/logo.png"
          alt="AML Consultant Logo"
          width={85}
          height={34}
          className="h-7 w-auto object-contain"
          priority
        />
      </a>

      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-1.5">
          <Link
            href="/dashboard"
            className="font-black text-sm tracking-tight text-white hover:text-indigo-300 transition-colors"
          >
            AML Consultant
          </Link>
          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            PMS
          </span>
        </div>

        {showWebsiteLink ? (
          <a
            href="https://www.amlconsultant.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 font-medium transition-colors mt-0.5 truncate"
            title="Ir a www.amlconsultant.com"
          >
            <Globe className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">www.amlconsultant.com</span>
            <ExternalLink className="w-2.5 h-2.5 flex-shrink-0 opacity-70" />
          </a>
        ) : showSubtitle ? (
          <p className="text-[11px] text-slate-400 leading-tight">
            Project Manager System
          </p>
        ) : null}
      </div>
    </div>
  );
}
