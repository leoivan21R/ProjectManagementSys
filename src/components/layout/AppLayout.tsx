'use client';

import React, { useState } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { DataProvider } from '@/context/DataContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { GlobalSearchModal } from '@/components/common/GlobalSearchModal';
import { ProjectModal } from '@/components/projects/ProjectModal';
import { Project } from '@/lib/types';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const handleOpenNewProject = () => {
    setProjectToEdit(null);
    setProjectModalOpen(true);
  };

  return (
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>
          <DataProvider>
            <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
            {/* Desktop Sidebar */}
            <Sidebar
              onOpenNewProject={handleOpenNewProject}
              className="hidden lg:flex"
            />

            {/* Mobile Navigation Drawer */}
            <MobileNav
              isOpen={mobileNavOpen}
              onClose={() => setMobileNavOpen(false)}
              onOpenNewProject={handleOpenNewProject}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <Navbar
                onOpenMobileNav={() => setMobileNavOpen(true)}
                onOpenSearch={() => setSearchOpen(true)}
              />

              <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                {children}
              </main>
            </div>

            {/* Global Search Dialog */}
            <GlobalSearchModal
              isOpen={searchOpen}
              onClose={() => setSearchOpen(false)}
            />

            {/* Project Creation/Edit Modal */}
            <ProjectModal
              isOpen={projectModalOpen}
              onClose={() => {
                setProjectModalOpen(false);
                setProjectToEdit(null);
              }}
              projectToEdit={projectToEdit}
            />
          </div>
        </DataProvider>
      </ToastProvider>
    </AuthProvider>
    </LanguageProvider>
  );
}
