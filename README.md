# Project Manager System (PMS)

Plataforma profesional, moderna y centralizada de gestión de proyectos, dirección y coordinación, tareas interactivas, administración de equipos multidisciplinarios y reportes ejecutivos con exportación en PDF y Excel.

Desarrollada 100% en español con **Next.js (App Router)**, **React**, **TypeScript**, **Tailwind CSS**, motor de base de datos relacional persistente, integración con **PostgreSQL / Supabase**, visualizaciones estadísticas con **Recharts** y generación de documentos corporativos.

---

## 🌟 Características Principales

### 1. Dashboard Ejecutivo
- **Indicadores Clave (KPIs):** Proyectos Activos, Proyectos Concluidos, Proyectos Cancelados, Tareas Atrasadas, Tareas Pendientes, Tareas En Progreso, Tareas Concluidas y Total de Tareas.
- **Gráficos Estadísticos Dinámicos (Recharts):**
  - Gráfico Donut de distribución de tareas por estado con colores reglamentarios.
  - Gráfico de barras de progreso general por proyecto (%).
- **Buscador y Filtro Rápido:** Consulta en tiempo real por título, código o Project Manager.
- **Listado de Proyectos:** Tarjetas con Project Manager, fecha estimada de finalización y barra visual de avance.

### 2. Módulo de Creación y Edición de Proyectos
- Identificador único autogenerado secuencialmente (`PRJ-2026-001`).
- Título, fecha de comienzo, fecha estimada de culminación, resumen introductorio, objetivos principales dinámicos, prioridad (Baja, Media, Alta, Crítica) y estado general.
- Asignación de Project Manager y asistentes directivos con roles específicos.
- Operaciones de guardar, editar, archivar y eliminar a la papelera con confirmación modal.

### 3. Dirección y Coordinación del Proyecto
- **Project Manager:** Responsable principal, datos de contacto y supervisión global.
- **Asistentes:** Incorporación de múltiples asistentes con responsabilidades específicas (ej. Aseguramiento de Calidad, Coordinación Técnica, Scrum Master).
- Capacidad de asignación cruzada: un mismo profesional puede participar y coordinar múltiples proyectos.

### 4. Administración de Equipos
- Directorio centralizado de miembros y profesionales.
- Prevención estricta de duplicados mediante validación de correo electrónico único.
- Conteo automático de proyectos asignados y tareas asignadas (incluyendo cuántas concluidas y atrasadas).

### 5. Administración Interactiva de Tareas (11 Columnas Requeridas)
1. **Identificador:** Código único autogenerado (`TSK-0101`).
2. **Nombre:** Título y prioridad con insignia visual.
3. **Descripción:** Especificaciones y criterios de aceptación.
4. **Fecha de Comienzo:** Fecha formateada.
5. **Fecha Estimada de Culminación:** Detección automática de vencimiento.
6. **Persona Responsable:** Avatar, nombre y correo del asignado.
7. **Porcentaje de Avance:** Control interactivo de 0% a 100%.
8. **Barra Visual de Progreso:** Animada con código de colores según el estado.
9. **Estado:** Selector interactivo directo con colores normalizados.
10. **Comentarios:** Contador de comentarios que abre modal con historial y auditoría.
11. **Acciones:** Editar, Duplicar, Enviar seguimiento, Archivar y Mover a papelera.

### 6. Estados y Reglas de Progreso Automáticas
- **Gris:** Pendiente (Avance fijado inicialmente en 0%).
- **Azul:** En progreso (Avance manual entre 1% y 99%).
- **Verde:** Concluido (Fija automáticamente el avance en 100%).
- **Rojo:** Cancelado (Conserva historial de avance y comentarios; se excluye del promedio del proyecto).
- **Insignia de Alerta ¡Atrasada!:** Identificación visual destacada para tareas cuya fecha límite venció sin estar concluidas ni canceladas.

### 7. Comentarios y Auditoría de Actividad
- Hilo de comentarios con autor, fecha, hora y contenido.
- Registro automático (*audit log*) de modificaciones críticas: cambios de estado, responsable, fechas y porcentaje de avance.

### 8. Seguimiento por Correo Electrónico
- Botón **"Enviar seguimiento"** en cada tarea.
- Prepara un mensaje prellenado dirigido al correo del responsable con:
  - Nombre del proyecto.
  - Nombre de la tarea y código.
  - Descripción.
  - Estado actual y porcentaje de avance.
  - Fecha estimada de culminación.
  - Solicitud formal de actualización.
- Acciones: *"Abrir en mi gestor de correo"* (`mailto:`) y *"Copiar al portapapeles"*.
- **Garantía de privacidad:** Nunca despacha correos sin la confirmación explícita del usuario.

### 9. Cálculo del Progreso General del Proyecto
- **Fórmula:** Promedio ponderado de los porcentajes de avance de todas las tareas activas (excluyendo tareas canceladas).
- Si no existen tareas activas, muestra *"Sin progreso calculable"*.
- Barra de progreso dinámica y porcentaje numérico.

### 10. Módulo de Reportes Ejecutivos (PDF y Excel)
- Filtros combinables: Proyecto, Project Manager, Asistente, Responsable, Estado de tarea, Rango de fechas, Tareas atrasadas y Prioridad.
- Gráficos de distribución de tareas y progreso general.
- **Exportación a PDF:** Documento apaisado con portada ejecutiva, cajas de KPI, resumen de proyectos, tabla detallada de tareas con alertas de atraso y marca de tiempo (`Generado el: DD/MM/YYYY a las HH:mm`).
- **Exportación a Excel (.xlsx):** Libro de cálculo con pestañas organizadas (*Resumen Ejecutivo*, *Listado de Tareas*, *Proyectos*).

### 11. Usuarios y Permisos (RBAC) con Simulador
- **Administrador:** Acceso total, eliminación de proyectos, mantenimiento de usuarios.
- **Project Manager:** Gestión de proyectos asignados, asistentes, tareas y miembros.
- **Miembro del equipo:** Consulta de proyectos asignados, actualización de sus tareas y comentarios.
- **Selector de Perfiles:** Menú superior para alternar instantáneamente entre Carlos Gómez (Admin), Elena Rostova (PM) o David Méndez (Miembro) para verificar las reglas de seguridad.

### 12. Papelera de Recuperación
- Toda tarea o proyecto eliminado se traslada inicialmente a la papelera.
- Opción de restauración con 1 clic.
- Eliminación definitiva con confirmación modal.

---

## 🛠️ Arquitectura Tecnológica

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript.
- **Diseño & UI:** Tailwind CSS v4, Lucide React Icons.
- **Backend:** Next.js Route Handlers (API REST modular).
- **Base de Datos Persistente Local:** Motor relacional persistente en `/data/pms_db.json` con escrituras atómicas (ACID) y cero configuración externa requerida para ejecución inmediata.
- **Base de Datos Cloud:** Esquema completo en PostgreSQL para **Supabase** (`src/supabase/schema.sql`) con RLS, triggers e índices.
- **Gráficos:** Recharts.
- **Exportación:** jsPDF, jspdf-autotable, SheetJS (XLSX).

---

## 🚀 Instrucciones de Instalación y Ejecución Local

### Prerrequisitos
- Node.js versión 18+ (recomendado Node 20+)
- npm versión 9+

### Pasos

1. **Clonar o situarse en el directorio del proyecto:**
   ```bash
   cd "ProyectManagementSys"
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador:**
   Navega a [http://localhost:3000](http://localhost:3000).

La aplicación iniciará automáticamente con datos semilla demostrativos listos para usar y evaluar.

---

## 🗄️ Esquema de Base de Datos y Supabase

El archivo `src/supabase/schema.sql` contiene el esquema DDL completo para PostgreSQL:
- Tablas: `users`, `projects`, `project_assistants`, `project_members`, `tasks`, `task_comments`, `activity_logs`, `notifications`.
- Restricciones de integridad referencial (`FOREIGN KEY`, `CHECK`, `ON DELETE CASCADE`).
- Políticas de Seguridad de Fila (**Row Level Security - RLS**).
- Triggers para la actualización automática del campo `updated_at`.
- Datos semilla precargados en español.

Para conectar con Supabase en la nube:
1. Copia `.env.example` a `.env.local`.
2. Define `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Ejecuta el script `src/supabase/schema.sql` en el SQL Editor de tu panel de Supabase.

---

## 📁 Estructura del Código Fuente

```
src/
├── app/
│   ├── page.tsx                     # Dashboard Principal
│   ├── dashboard/page.tsx           # Ruta alternativa al Dashboard
│   ├── proyectos/page.tsx           # Catálogo de Proyectos
│   ├── proyectos/[id]/page.tsx      # Detalle de Proyecto (Tareas, Dirección, Equipo, Actividad)
│   ├── direccion/page.tsx           # Dirección y Coordinación
│   ├── equipos/page.tsx             # Directorio de Equipos
│   ├── tareas/page.tsx              # Administración Global de Tareas
│   ├── reportes/page.tsx            # Reportes Ejecutivos (Filtros, PDF y Excel)
│   ├── notificaciones/page.tsx      # Alertas y Notificaciones
│   ├── administracion/page.tsx      # Matriz RBAC y Usuarios
│   ├── configuracion/page.tsx       # Ajustes del Sistema
│   ├── papelera/page.tsx            # Papelera de Recuperación
│   └── api/                         # Endpoints REST (projects, tasks, users, stats, etc.)
├── components/
│   ├── layout/                      # Sidebar, Navbar, MobileNav, UserRoleSwitcher
│   ├── dashboard/                   # KpiCards, StatusCharts, RecentProjects
│   ├── projects/                    # ProjectModal, ProjectDirectionCard
│   ├── tasks/                       # TaskTable, TaskModal, TaskCommentsModal, FollowUpEmailModal
│   ├── team/                        # MemberModal
│   └── common/                      # ConfirmModal, ProgressBar, GlobalSearchModal
├── context/                         # AuthContext (RBAC), DataContext, ToastContext
├── lib/
│   ├── types.ts                     # Interfaces TypeScript
│   ├── utils.ts                     # Formateo de fechas, estilos de estado y plantilla de correo
│   ├── supabase.ts                  # Cliente Supabase
│   ├── db/                          # Motor de base de datos persistente y seed data
│   └── export/                      # Generadores de PDF y Excel
└── supabase/
    └── schema.sql                   # Esquema DDL oficial de PostgreSQL/Supabase
```

---

## 🔒 Seguridad y Buenas Prácticas
- No se exponen credenciales ni claves privadas en el código fuente.
- Las operaciones destructivas solicitan confirmación previa del usuario.
- Los elementos eliminados se conservan inicialmente en papelera para evitar pérdidas accidentales.
- Validación de datos sensibles y control de duplicados en el servidor.
