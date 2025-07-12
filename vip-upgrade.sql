-- Script para agregar funcionalidad VIP a usuarios existentes

-- Agregar columnas VIP a la tabla users
ALTER TABLE public.users 
ADD COLUMN is_vip BOOLEAN DEFAULT FALSE,
ADD COLUMN vip_discount_percentage DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN vip_membership_start DATE,
ADD COLUMN vip_membership_end DATE;

-- Crear índice para búsquedas rápidas de usuarios VIP
CREATE INDEX idx_users_vip ON public.users(is_vip) WHERE is_vip = TRUE;

-- Función para verificar si la membresía VIP está activa
CREATE OR REPLACE FUNCTION is_vip_active(user_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = user_id 
        AND is_vip = TRUE 
        AND (vip_membership_end IS NULL OR vip_membership_end >= CURRENT_DATE)
    );
END;
$$ LANGUAGE plpgsql;

-- Crear algunos usuarios VIP de ejemplo (opcional)
-- Descomenta las siguientes líneas si quieres crear usuarios VIP de prueba

/*
UPDATE public.users 
SET is_vip = TRUE, 
    vip_discount_percentage = 15.00,
    vip_membership_start = CURRENT_DATE,
    vip_membership_end = CURRENT_DATE + INTERVAL '1 year'
WHERE email IN ('admin@gocine.com', 'user@test.com');
*/

-- Comentarios sobre los campos agregados:
-- is_vip: Boolean que indica si el usuario es VIP
-- vip_discount_percentage: Porcentaje de descuento (ej: 15.00 para 15%)
-- vip_membership_start: Fecha de inicio de la membresía VIP
-- vip_membership_end: Fecha de fin de la membresía VIP (NULL = permanente)
