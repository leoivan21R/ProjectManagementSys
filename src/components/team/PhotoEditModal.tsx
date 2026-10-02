'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  Link as LinkIcon,
  Trash2,
  Check,
  Sparkles,
} from 'lucide-react';
import { User } from '@/lib/types';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';

interface PhotoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function PhotoEditModal({ isOpen, onClose, user }: PhotoEditModalProps) {
  const { updateUser } = useData();
  const { t } = useLanguage();

  const [avatarUrl, setAvatarUrl] = useState('');
  const [photoFileName, setPhotoFileName] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setAvatarUrl(user.avatarUrl || '');
      setPhotoFileName('');
      setShowUrlInput(false);
      setErrorMsg('');
    }
  }, [user]);

  if (!isOpen || !user) return null;

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
    // Revert to generated initials avatar
    const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName)}`;
    setAvatarUrl(defaultAvatar);
    setPhotoFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await updateUser(user.id, {
        avatarUrl: avatarUrl.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al actualizar la foto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const computedPreview =
    avatarUrl.trim() ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.fullName)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800 shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('action.change_photo', 'Cambiar Foto')}
              </h2>
              <p className="text-xs text-slate-500 truncate max-w-[240px]">
                {user.fullName}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Central Avatar Preview */}
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl overflow-hidden bg-white dark:bg-slate-800 border-4 border-indigo-500/30 shadow-xl flex items-center justify-center">
                <img
                  src={computedPreview}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                />
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex flex-col items-center justify-center text-white text-xs font-bold gap-1"
                title="Cambiar foto"
              >
                <Camera className="w-5 h-5" />
                <span>Subir</span>
              </button>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {user.fullName}
              </p>
              <p className="text-[11px] text-slate-400">
                {user.jobTitle} • {user.department}
              </p>
            </div>
          </div>

          {/* Upload and URL controls */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp, image/gif"
              className="hidden"
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{t('action.upload_photo', 'Subir Fotografía')}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium transition-all"
                title="Ingresar URL de imagen"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>URL</span>
              </button>

              <button
                type="button"
                onClick={handleRemovePhoto}
                className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                title="Restablecer a avatar inicial"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {photoFileName && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span className="truncate">{photoFileName}</span>
              </p>
            )}

            {showUrlInput && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 animate-in fade-in">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Enlace directo a la imagen:
                </label>
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
            )}
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
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
              {isSubmitting ? 'Guardando...' : t('action.save', 'Guardar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
