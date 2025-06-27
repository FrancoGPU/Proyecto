-- Script para agregar columna is_admin a la tabla users

-- Agregar columna is_admin si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE public.users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Columna is_admin agregada a la tabla users';
    ELSE
        RAISE NOTICE 'Columna is_admin ya existe en la tabla users';
    END IF;
END
$$;

-- Actualizar usuarios existentes que tienen role = 'admin' para establecer is_admin = true
UPDATE public.users 
SET is_admin = true 
WHERE role = 'admin' AND (is_admin IS NULL OR is_admin = false);

-- Verificar que los usuarios admin tienen is_admin = true
SELECT id, username, email, role, is_admin 
FROM public.users 
WHERE role = 'admin';
