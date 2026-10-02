'use client';

import React, { useState } from 'react';
import { ShieldCheck, Users, ShieldAlert, Key, Database, RefreshCw, CheckCircle, Lock } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/types';
import Image from 'next/image';

export default function AdministracionPage() {
  const { users, resetDatabase } = useData();
  const { isAdmin, currentUser } = useAuth();
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = async () => {
    if (confirm('¿Estás seguro de que deseas restablecer la base de datos a sus valores iniciales de prueba?')) {
      await resetDatabase();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <ShieldAlert className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          Administración y Permisos del Sistema
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
          Control de acceso basado en roles (RBAC). Configura perfiles, asigna privilegios directivos y supervisa la integridad relacional de la base de datos.
        </p>
      </div>

      {!isAdmin && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-3">
          <Lock className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-bold">Acceso en Modo Lectura</p>
            <p className="mt-0.5">
              Tu perfil actual es <strong>{currentUser.role}</strong>. Puedes consultar la matriz de permisos, pero las modificaciones estructurales están reservadas para usuarios con perfil <strong>ADMIN</strong>. Cambia al usuario Carlos Gómez desde el menú superior para probar los permisos de administrador.
            </p>
          </div>
        </div>
      )}

      {/* RBAC Matrix */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-indigo-600" />
          Matriz de Privilegios por Perfil
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Operación / Privilegio</th>
                <th className="py-3 px-4 text-center">Administrador</th>
                <th className="py-3 px-4 text-center">Project Manager</th>
                <th className="py-3 px-4 text-center">Miembro de Equipo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-2.5 px-4 font-medium">Crear Proyectos</td>
                <td className="text-center text-emerald-600 font-bold">✓ Total</td>
                <td className="text-center text-emerald-600 font-bold">✓ Total</td>
                <td className="text-center text-slate-400">✗ Restringido</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium">Eliminar Proyectos (Permanente)</td>
                <td className="text-center text-emerald-600 font-bold">✓ Total</td>
                <td className="text-center text-slate-400">✗ Restringido</td>
                <td className="text-center text-slate-400">✗ Restringido</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium">Designar Asistentes y Miembros</td>
                <td className="text-center text-emerald-600 font-bold">✓ Total</td>
                <td className="text-center text-emerald-600 font-bold">✓ Propios</td>
                <td className="text-center text-slate-400">✗ Restringido</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium">Asignar y Crear Tareas</td>
                <td className="text-center text-emerald-600 font-bold">✓ Total</td>
                <td className="text-center text-emerald-600 font-bold">✓ Propios</td>
                <td className="text-center text-slate-400">✗ Restringido</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium">Actualizar Avance y Estado de Tareas</td>
                <td className="text-center text-emerald-600 font-bold">✓ Total</td>
                <td className="text-center text-emerald-600 font-bold">✓ Propios</td>
                <td className="text-center text-emerald-600 font-bold">✓ Solo Asignadas</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium">Añadir Comentarios en Tareas</td>
                <td className="text-center text-emerald-600 font-bold">✓ Total</td>
                <td className="text-center text-emerald-600 font-bold">✓ Total</td>
                <td className="text-center text-emerald-600 font-bold">✓ Total</td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium">Generar Reportes Ejecutivos (PDF/Excel)</td>
                <td className="text-center text-emerald-600 font-bold">✓ General</td>
                <td className="text-center text-emerald-600 font-bold">✓ Propios/General</td>
                <td className="text-center text-emerald-600 font-bold">✓ Consulta</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Directory Administration */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-600" />
          Directorio de Usuarios y Roles Registrados
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {users.map((u) => (
            <div key={u.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Image
                  src={u.avatarUrl}
                  alt={u.fullName}
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover"
                  unoptimized
                />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{u.fullName}</p>
                  <p className="text-[11px] text-slate-500">{u.jobTitle} • {u.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    u.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                      : u.role === 'PROJECT_MANAGER'
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {u.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Database Maintenance */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-600" />
          Mantenimiento de la Base de Datos
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Project Manager System utiliza un motor de almacenamiento relacional persistente local con sincronización atómica a disco. Puedes restablecer los datos de demostración en cualquier momento para reiniciar las pruebas.
        </p>

        <div className="pt-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restablecer Datos Semilla (Demo)</span>
          </button>
          {resetSuccess && (
            <p className="text-xs font-semibold text-emerald-600 mt-2 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Base de datos restaurada correctamente.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
