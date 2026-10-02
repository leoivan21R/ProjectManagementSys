import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppLayout } from '@/components/layout/AppLayout';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'AML Consultant | Project Manager System (PMS)',
  description:
    'Plataforma integral de gestión de proyectos, dirección y coordinación, tareas interactivas, equipos multidisciplinarios y reportes ejecutivos en PDF y Excel.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
