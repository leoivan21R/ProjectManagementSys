'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  UserPlus,
  Mail,
  Briefcase,
  Shield,
  Building,
  Upload,
  Camera,
  Link as LinkIcon,
  Trash2,
  Check,
} from 'lucide-react';
import { UserRole, User } from '@/lib/types';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import Image from 'next/image';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: User | null;
}

export function MemberModal({ isOpen, onClose, memberToEdit }: MemberModalProps) {
  const { createUser, updateUser } = useData();
  const { t } = useLanguage();

  const isEditing = Boolean(memberToEdit);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('Desarrollo');
  const [role, setRole] = useState<UserRole>('TEAM_MEMBER');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [photoFileName, setPhotoFileName] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when opening or changing memberToEdit
  React.useEffect(() => {
    if (memberToEdit) {
      setFullName(memberToEdit.fullName);
      setEmail(memberToEdit.email);
      setJobTitle(memberToEdit.jobTitle);
      setDepartment(memberToEdit.department || 'Desarrollo');
      setRole(memberToEdit.role);
      setAvatarUrl(memberToEdit.avatarUrl || '');
      setPhotoFileName('');
      setShowUrlInput(false);
      setErrorMsg('');
    } else {
      setFullName('');
      setEmail('');
      setJobTitle('');
      setDepartment('Desarrollo');
      setRole('TEAM_MEMBER');
      setAvatarUrl('');
      setPhotoFileName('');
      setShowUrlInput(false);
      setErrorMsg('');
    }
  }, [memberToEdit, isOpen]);

  if (!isOpen) return null;

  // Handle local image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('La imagen no debe superar los 5MB');
      return;
    }

    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAvatarUrl(dataUrl);
      setPhotoFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    setPhotoFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !email.trim() || !jobTitle.trim()) {
      setErrorMsg('Nombre completo, correo electrónico y cargo son requeridos');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && memberToEdit) {
        await updateUser(memberToEdit.id, {
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          jobTitle: jobTitle.trim(),
          department: department.trim(),
          role,
          avatarUrl: avatarUrl.trim() || undefined,
        });
      } else {
        await createUser({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          jobTitle: jobTitle.trim(),
          department: department.trim(),
          role,
          avatarUrl: avatarUrl.trim() || undefined,
        });
      }
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al guardar los datos del miembro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const computedPreview =
    avatarUrl.trim() ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName.trim() || 'Nuevo Miembro')}`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800 shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Editar Información del Miembro' : t('action.add_member', 'Incorporar Miembro')}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? 'Modifica el rol de acceso (ej: Administrador, Project Manager), cargo, departamento y foto.'
                  : 'Directorio de talento de AML Consultant con fotografía personalizada.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body with Scroll */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Photo Upload Section */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{t('teams.photo_upload_title', 'Fotografía del Miembro')}</span>
              </label>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{t('teams.remove_photo', 'Quitar foto')}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Preview Avatar Box */}
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border-2 border-indigo-500/40 shadow-md flex-shrink-0">
                <img
                  src={computedPreview}
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Actions to upload or link */}
              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  className="hidden"
                />

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{t('action.upload_photo', 'Subir Fotografía')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium transition-all"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>O pegar enlace URL</span>
                  </button>
                </div>

                {photoFileName ? (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span className="truncate max-w-[200px]">{photoFileName}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400">
                    PNG, JPG o WEBP hasta 5MB. Si no se sube foto, se generará un avatar automático.
                  </p>
                )}
              </div>
            </div>

            {/* Direct URL input accordion */}
            {showUrlInput && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 animate-in fade-in">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Enlace directo de la imagen:
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
                    onChange={(e) => {
                      setAvatarUrl(e.target.value);
                      setPhotoFileName('');
                    }}
                    placeholder="https://ejemplo.com/fotos/perfil.jpg"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Nombre Completo *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej: Gabriela Mendoza"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Correo Electrónico Único *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="gabriela.mendoza@amlconsultant.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Responsabilidad Principal / Cargo *
            </label>
            <input
              type="text"
              required
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Ej: Especialista de Seguridad Cloud"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" /> Departamento
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Ej: Ciberseguridad"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-slate-400" /> Perfil de Sistema
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="TEAM_MEMBER">Miembro del equipo</option>
                <option value="PROJECT_MANAGER">Project Manager</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              {t('action.cancel', 'Cancelar')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-60"
            >
              {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar Cambios' : t('action.add_member', 'Registrar Miembro')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
