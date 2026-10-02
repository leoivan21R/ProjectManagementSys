'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Briefcase,
  Building,
  FolderKanban,
  CheckSquare,
  Shield,
  Trash2,
  Camera,
  UserCog,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { MemberModal } from '@/components/team/MemberModal';
import { PhotoEditModal } from '@/components/team/PhotoEditModal';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { User } from '@/lib/types';
import Image from 'next/image';

export default function EquiposPage() {
  const { users, projects, tasks, deleteUser } = useData();
  const { isAdmin, isProjectManager } = useAuth();
  const { t } = useLanguage();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('TODOS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<User | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<User | null>(null);
  const [memberToEditPhoto, setMemberToEditPhoto] = useState<User | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      (u.department || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (roleFilter !== 'TODOS' && u.role !== roleFilter) return false;

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            {t('teams.title', 'Administración de Equipos y Miembros')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            {t('teams.subtitle', 'Directorio corporativo de talento de AML Consultant. Visualiza proyectos, tareas asignadas, gestiona fotos de perfil e incorpora o elimina miembros del equipo.')}
          </p>
        </div>

        {(isAdmin || isProjectManager) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('action.add_member', 'Incorporar Miembro')}</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('teams.search_placeholder', 'Buscar por nombre, correo, cargo o departamento...')}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-700 dark:text-slate-300"
        >
          <option value="TODOS">{t('teams.all_profiles', 'Todos los Perfiles')}</option>
          <option value="ADMIN">{t('role.ADMIN', 'Administrador')}</option>
          <option value="PROJECT_MANAGER">{t('role.PROJECT_MANAGER', 'Project Manager')}</option>
          <option value="TEAM_MEMBER">{t('role.TEAM_MEMBER', 'Miembro del equipo')}</option>
        </select>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => {
          // Calculate assigned projects (either PM, assistant, or member)
          const assignedProjects = projects.filter(
            (p) =>
              !p.deletedAt &&
              (p.managerId === user.id ||
                p.assistants?.some((a) => a.userId === user.id) ||
                p.members?.some((m) => m.userId === user.id))
          );

          // Calculate assigned tasks
          const assignedTasks = tasks.filter((t) => !t.deletedAt && t.assigneeId === user.id);
          const completedTasksCount = assignedTasks.filter((t) => t.status === 'CONCLUIDO').length;
          const overdueTasksCount = assignedTasks.filter((t) => t.isOverdue).length;

          return (
            <div
              key={user.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header Profile with interactive Photo Upload/Change */}
                <div className="flex items-start gap-3.5">
                  <div
                    className="relative group/avatar cursor-pointer flex-shrink-0"
                    onClick={() => (isAdmin || isProjectManager) && setMemberToEditPhoto(user)}
                    title={isAdmin || isProjectManager ? t('action.change_photo', 'Cambiar Foto') : user.fullName}
                  >
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-indigo-500/20 shadow-sm">
                      <Image
                        src={user.avatarUrl}
                        alt={user.fullName}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    {(isAdmin || isProjectManager) && (
                      <div className="absolute inset-0 bg-slate-950/60 rounded-2xl opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                        <Camera className="w-4 h-4" />
                        <span className="text-[8px] font-bold mt-0.5">FOTO</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                      {user.fullName}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                      <Briefcase className="w-3 h-3 flex-shrink-0" />
                      <span className="line-clamp-1">{user.jobTitle}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <Building className="w-3 h-3 text-slate-400" />
                    {user.department || 'General'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    <Shield className="w-3 h-3 text-indigo-500" />
                    {t(`role.${user.role}`, user.role)}
                  </span>
                </div>

                {/* Assigned Projects & Tasks Counts */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <FolderKanban className="w-3 h-3" /> {t('teams.projects_label', 'Proyectos')}
                    </span>
                    <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                      {assignedProjects.length}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <CheckSquare className="w-3 h-3" /> {t('teams.tasks_label', 'Tareas')}
                    </span>
                    <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                      {assignedTasks.length}
                      <span className="text-[10px] font-normal text-slate-400 ml-1">
                        ({completedTasksCount})
                      </span>
                    </p>
                  </div>
                </div>

                {/* Overdue alert badge if any */}
                {overdueTasksCount > 0 && (
                  <div className="mt-2.5 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-[11px] font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span>{t('teams.overdue_alert', 'Tiene tarea(s) atrasadas')}: {overdueTasksCount}</span>
                  </div>
                )}
              </div>

              {/* Projects List Summary */}
              {assignedProjects.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                  <p className="text-slate-400 mb-1 font-medium">{t('teams.participates_in', 'Participa en:')}</p>
                  <div className="flex flex-wrap gap-1">
                    {assignedProjects.map((p) => (
                      <Link
                        key={p.id}
                        href={`/proyectos/${p.id}`}
                        className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-1.5 py-0.5 rounded hover:underline"
                      >
                        {p.code}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Member Actions: Edit Info, Change Photo & Delete Member */}
              {(isAdmin || isProjectManager) && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setMemberToEdit(user)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/70 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-600 dark:hover:text-white text-xs font-semibold transition-all shadow-xs"
                      title={t('teams.edit_data', 'Editar Datos')}
                    >
                      <UserCog className="w-3.5 h-3.5" />
                      <span>{t('teams.edit_data', 'Editar Datos')}</span>
                    </button>

                    <button
                      onClick={() => setMemberToEditPhoto(user)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all shadow-xs"
                      title={t('action.change_photo', 'Cambiar Foto')}
                    >
                      <Camera className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{t('teams.photo_upload_title', 'Foto')}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setMemberToDelete(user)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 hover:bg-rose-600 hover:text-white dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white text-xs font-semibold transition-all shadow-xs"
                    title={t('action.delete_member', 'Eliminar Miembro')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('action.delete_member', 'Eliminar')}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Member Creation & Edit Modal */}
      <MemberModal
        isOpen={isModalOpen || !!memberToEdit}
        onClose={() => {
          setIsModalOpen(false);
          setMemberToEdit(null);
        }}
        memberToEdit={memberToEdit}
      />

      {/* Member Photo Edit Modal (For existing members) */}
      <PhotoEditModal
        isOpen={!!memberToEditPhoto}
        onClose={() => setMemberToEditPhoto(null)}
        user={memberToEditPhoto}
      />

      {/* Member Deletion Confirmation Modal */}
      <ConfirmModal
        isOpen={!!memberToDelete}
        title={`¿Eliminar a ${memberToDelete?.fullName || 'este miembro'}?`}
        message={`Esta acción dará de baja al miembro "${memberToDelete?.fullName}" (${memberToDelete?.email}) del directorio corporativo. Se desvinculará de los proyectos y tareas asignadas.`}
        confirmText={t('action.delete_member', 'Eliminar Miembro')}
        cancelText={t('action.cancel', 'Cancelar')}
        isDestructive={true}
        onConfirm={async () => {
          if (memberToDelete) {
            await deleteUser(memberToDelete.id);
            setMemberToDelete(null);
          }
        }}
        onCancel={() => setMemberToDelete(null)}
      />
    </div>
  );
}
