import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, UserCheck, Users, ChevronDown, Check, UserPlus } from 'lucide-react';
import Image from 'next/image';

export function UserRoleSwitcher() {
  const { currentUser, allUsers, switchUserById } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Administrador', bg: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300', icon: ShieldCheck };
      case 'PROJECT_MANAGER':
        return { label: 'Project Manager', bg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300', icon: UserCheck };
      default:
        return { label: 'Miembro de Equipo', bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', icon: Users };
    }
  };

  const currentBadge = getRoleBadge(currentUser?.role);
  const CurrentIcon = currentBadge.icon;

  const currentAvatar = currentUser?.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=AML';
  const currentName = currentUser?.fullName || 'Invitado';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm"
        title="Cambiar perfil de usuario para probar permisos"
      >
        <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-700">
          <Image
            src={currentAvatar}
            alt={currentName}
            width={32}
            height={32}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
            {currentName}
          </p>
          <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md ${currentBadge.bg}`}>
            <CurrentIcon className="w-3 h-3" />
            {currentBadge.label}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Simulador de Perfiles (RBAC)
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Selecciona un usuario del equipo para evaluar sus permisos:
              </p>
            </div>

            <div className="space-y-1 max-h-80 overflow-y-auto">
              {allUsers.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  <p>No hay colaboradores registrados en el directorio.</p>
                  <Link
                    href="/equipos"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Incorporar Miembro</span>
                  </Link>
                </div>
              ) : (
                allUsers.map((user) => {
                  const badge = getRoleBadge(user.role);
                  const isSelected = user.id === currentUser?.id;
                  const Icon = badge.icon;

                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        switchUserById(user.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                          <Image
                            src={user.avatarUrl}
                            alt={user.fullName}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {user.fullName}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md ${badge.bg}`}>
                              <Icon className="w-2.5 h-2.5" />
                              {badge.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mr-1 flex-shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 px-2 py-1">
              <Link
                href="/equipos"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Gestionar Equipos</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
