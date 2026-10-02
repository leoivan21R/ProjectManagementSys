'use client';

import React from 'react';
import { Settings, Database, Cloud, Terminal, Shield, Check } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          Configuración del Sistema
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Ajustes de infraestructura, base de datos relacional, variables de entorno y despliegue.
        </p>
      </div>

      {/* Database Connection Status */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-600" />
          Estado del Motor de Persistencia de Datos
        </h3>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Motor Activo Local:</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Archivo Relacional Persistente (JSON ACID)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Ruta de Persistencia Local:</span>
            <span className="font-mono text-slate-800 dark:text-slate-200 text-[11px]">
              /data/pms_db.json
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Conexión con Supabase / PostgreSQL:</span>
            <span className={`font-semibold ${isSupabaseConfigured ? 'text-emerald-600' : 'text-amber-600'}`}>
              {isSupabaseConfigured ? 'Conectado a la nube Supabase' : 'Modo Autónomo Local (Cero dependencias)'}
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Instrucciones para Conectar con Supabase Cloud
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            1. Crea un proyecto en <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold underline">Supabase.com</a>.
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            2. En el Editor SQL de tu proyecto Supabase, ejecuta el script oficial incluido en el archivo <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">src/supabase/schema.sql</code>.
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            3. Añade las siguientes variables de entorno en tu archivo <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">.env.local</code>:
          </p>

          <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed">
{`NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-aqui
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`}
          </pre>
        </div>
      </div>

      {/* Security Policies */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-600" />
          Políticas de Seguridad y Privacidad
        </h3>
        <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
          <li className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span>Las contraseñas y credenciales sensibles nunca se transmiten en texto plano.</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span>Eliminaciones protegidas mediante confirmación modal y papelera de recuperación.</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span>Validación de unicidad de correos para evitar duplicación de identidades.</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span>El seguimiento por correo nunca se despacha de forma no consentida.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
