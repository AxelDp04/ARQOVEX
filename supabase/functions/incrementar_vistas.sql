-- 📈 FUNCIÓN: INCREMENTAR VISTAS
-- Incrementa el contador de vistas de un plano/propiedad de forma segura y atómica.

CREATE OR REPLACE FUNCTION public.incrementar_vistas(target_plano_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.planos 
    SET total_vistas = COALESCE(total_vistas, 0) + 1
    WHERE id = target_plano_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario: Permite que usuarios anónimos o registrados activen el contador sin permisos de escritura directa.
GRANT EXECUTE ON FUNCTION public.incrementar_vistas(UUID) TO anon, authenticated;
