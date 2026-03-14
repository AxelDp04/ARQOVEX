-- 🏗️ MIGRACIÓN: ARQOVEX MARKETPLACE EVOLUTION
-- Este script prepara la DB para socios profesionales y moderación de contenido.

-- 1. Actualizar tabla de perfiles para datos profesionales
ALTER TABLE public.perfiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS es_socio BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS telefono_profesional TEXT;

-- 2. Actualizar tabla de planos para multi-vendedor y moderación
-- Crear el tipo enum si no existe
DO $$ BEGIN
    CREATE TYPE estado_revision_tipo AS ENUM ('en_revision', 'publicado', 'rechazado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.planos
ADD COLUMN IF NOT EXISTS vendedor_id UUID REFERENCES public.perfiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS estado_revision estado_revision_tipo DEFAULT 'en_revision';

-- 3. Crear tabla de solicitudes de socios (si no existe o extenderla)
CREATE TABLE IF NOT EXISTS public.solicitudes_vendedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_completo TEXT NOT NULL,
    telefono TEXT NOT NULL,
    bio TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    estado TEXT DEFAULT 'pendiente', -- 'pendiente', 'aprobado', 'rechazado'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Función para aprobar socio automáticamente
CREATE OR REPLACE FUNCTION public.sistema_aprobar_socio(solicitud_id UUID)
RETURNS VOID AS $$
DECLARE
    uid UUID;
    v_nombre TEXT;
    v_bio TEXT;
    v_socials JSONB;
    v_telefono TEXT;
BEGIN
    -- Obtener datos de la solicitud
    SELECT usuario_id, nombre_completo, bio, social_links, telefono 
    INTO uid, v_nombre, v_bio, v_socials, v_telefono
    FROM solicitudes_vendedores 
    WHERE id = solicitud_id;

    -- Actualizar perfil del usuario
    UPDATE perfiles 
    SET 
        es_socio = true,
        nombre_completo = COALESCE(v_nombre, nombre_completo),
        bio = v_bio,
        social_links = v_socials,
        telefono_profesional = v_telefono
    WHERE id = uid;

    -- Marcar solicitud como aprobada
    UPDATE solicitudes_vendedores 
    SET estado = 'aprobado' 
    WHERE id = solicitud_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Seguridad (RLS) básica para las nuevas columnas
-- Permitir que el vendedor vea sus propios proyectos en revisión
CREATE POLICY "Vendedores pueden ver su propio inventario" 
ON public.planos FOR SELECT 
USING (auth.uid() = vendedor_id OR estado_revision = 'publicado');

-- Comentario: Axel podrá moderar desde el panel usando Service Role o políticas admin.
