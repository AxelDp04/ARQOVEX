-- Añadir columna cédula a solicitudes de vendedores (Asóciate)
ALTER TABLE public.solicitudes_vendedores
ADD COLUMN IF NOT EXISTS cedula TEXT;
