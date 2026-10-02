-- ==============================================================================
-- PROJECT MANAGER SYSTEM (PMS) - POSTGRESQL / SUPABASE DATABASE SCHEMA
-- Compatible con PostgreSQL 14+ y Supabase
-- ==============================================================================

-- 1. EXTENSIONES REQUERIDAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TIPOS ENUMERADOS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('PLANIFICACION', 'EN_PROGRESO', 'EN_PAUSA', 'CONCLUIDO', 'CANCELADO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_status AS ENUM ('PENDIENTE', 'EN_PROGRESO', 'CONCLUIDO', 'CANCELADO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE item_priority AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'CRITICA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('INFO', 'WARNING', 'ALERT', 'SUCCESS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLA DE USUARIOS (Integrada con Supabase Auth si aplica)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'TEAM_MEMBER',
    avatar_url TEXT,
    job_title VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA DE PROYECTOS
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    objectives JSONB DEFAULT '[]'::jsonb,
    priority item_priority NOT NULL DEFAULT 'MEDIA',
    status project_status NOT NULL DEFAULT 'PLANIFICACION',
    start_date DATE NOT NULL,
    target_date DATE NOT NULL,
    manager_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    archived BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_dates CHECK (target_date >= start_date)
);

-- 5. ASISTENTES DEL PROJECT MANAGER POR PROYECTO
CREATE TABLE IF NOT EXISTS project_assistants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    responsibility VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- 6. MIEMBROS DE EQUIPO POR PROYECTO
CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    responsibility VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- 7. TABLA DE TAREAS
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    start_date DATE NOT NULL,
    due_date DATE NOT NULL,
    assignee_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status task_status NOT NULL DEFAULT 'PENDIENTE',
    priority item_priority NOT NULL DEFAULT 'MEDIA',
    archived BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_task_dates CHECK (due_date >= start_date)
);

-- 8. COMENTARIOS EN TAREAS
CREATE TABLE IF NOT EXISTS task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_email VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. REGISTRO DE AUDITORÍA Y ACTIVIDAD
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. NOTIFICACIONES
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL DEFAULT 'INFO',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 11. ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_projects_manager ON projects(manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_deleted ON projects(deleted_at);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_deleted ON tasks(deleted_at);
CREATE INDEX IF NOT EXISTS idx_comments_task ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_activity_project ON activity_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- 12. TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA DE TIMESTAMP
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_projects_updated_at ON projects;
CREATE TRIGGER trigger_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_tasks_updated_at ON tasks;
CREATE TRIGGER trigger_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 13. POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura generales para usuarios autenticados
CREATE POLICY "Lectura de usuarios autenticados" ON users FOR SELECT USING (true);
CREATE POLICY "Lectura de proyectos activos" ON projects FOR SELECT USING (true);
CREATE POLICY "Lectura de asistentes" ON project_assistants FOR SELECT USING (true);
CREATE POLICY "Lectura de miembros" ON project_members FOR SELECT USING (true);
CREATE POLICY "Lectura de tareas" ON tasks FOR SELECT USING (true);
CREATE POLICY "Lectura de comentarios" ON task_comments FOR SELECT USING (true);
CREATE POLICY "Lectura de actividad" ON activity_logs FOR SELECT USING (true);
CREATE POLICY "Lectura de notificaciones propias" ON notifications FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- ==============================================================================
-- DATOS SEMILLA (SEEDS) INICIALES EN ESPAÑOL
-- ==============================================================================

INSERT INTO users (id, email, full_name, role, avatar_url, job_title, department) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@pms.com', 'Carlos Gómez', 'ADMIN', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Director de Operaciones & TI', 'Dirección General'),
('22222222-2222-2222-2222-222222222222', 'pm.elena@pms.com', 'Elena Rostova', 'PROJECT_MANAGER', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'Senior Project Manager PMP', 'Gestión de Proyectos'),
('33333333-3333-3333-3333-333333333333', 'pm.marcos@pms.com', 'Marcos Valenzuela', 'PROJECT_MANAGER', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Project Lead Agile', 'Innovación Digital'),
('44444444-4444-4444-4444-444444444444', 'sofia.asistente@pms.com', 'Sofía Castillo', 'TEAM_MEMBER', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'Coordinadora de Aseguramiento de Calidad', 'Calidad & Procesos'),
('55555555-5555-5555-5555-555555555555', 'david.dev@pms.com', 'David Méndez', 'TEAM_MEMBER', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'Ingeniero de Software Fullstack', 'Desarrollo'),
('66666666-6666-6666-6666-666666666666', 'lucia.ux@pms.com', 'Lucía Navarrete', 'TEAM_MEMBER', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'Especialista UX/UI & Accesibilidad', 'Diseño de Producto')
ON CONFLICT (email) DO NOTHING;

INSERT INTO projects (id, code, title, summary, objectives, priority, status, start_date, target_date, manager_id) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PRJ-2026-001', 'Plataforma Core de Banca Digital Omni-Canal', 'Modernización de la infraestructura bancaria web y móvil para más de 500,000 clientes activos con seguridad biométrica y transferencias instantáneas.', '["Implementar arquitectura de microservicios resiliente","Garantizar disponibilidad 99.99%","Cumplir con normativa bancaria PCI-DSS","Rediseñar flujo de transferencias con autenticación multifactor"]'::jsonb, 'CRITICA', 'EN_PROGRESO', '2026-01-15', '2026-08-30', '22222222-2222-2222-2222-222222222222'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'PRJ-2026-002', 'Sistema Integrado ERP para Cadena de Suministro', 'Consolidación de inventarios en tiempo real, trazabilidad con códigos QR y optimización de rutas de distribución regional.', '["Reducir mermas de almacén en un 35%","Integrar telemetría vehicular IoT","Automatizar emisión de guías de despacho electrónicas"]'::jsonb, 'ALTA', 'EN_PROGRESO', '2026-02-01', '2026-11-15', '33333333-3333-3333-3333-333333333333'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'PRJ-2026-003', 'Renovación de Portal de Clientes y Soporte IA', 'Portal corporativo con chatbot conversacional con IA generativa para resolución inmediata de incidencias de primer nivel.', '["Desplegar asistente virtual bilingüe","Integrar con CRM corporativo","Disminuir tiempo de respuesta promedio a menos de 2 minutos"]'::jsonb, 'MEDIA', 'CONCLUIDO', '2025-09-01', '2026-02-28', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (code) DO NOTHING;
