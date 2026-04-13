-- Agregar columna 'destacado' a la tabla de planos
ALTER TABLE public.planos 
ADD COLUMN IF NOT EXISTS destacado BOOLEAN DEFAULT false;

-- Comentario: Permite que los admins marquen diseños específicos para aparecer en la página de inicio.
COMMENT ON COLUMN public.planos.destacado IS 'Si es true, el diseño aparecerá en la sección de Destacados de la Home.';
