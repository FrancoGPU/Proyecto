-- Script para crear un usuario administrador

-- Insertar usuario admin si no existe
INSERT INTO public.users (username, email, password, role, is_vip, vip_discount_percentage)
SELECT 
    'admin',
    'admin@gocine.com',
    '$2b$10$YHcFKKXJnqVtI5uGcoQHdeVFNrJHwHJ3DI.1ksF3wvlqvPqGF5jKK', -- password: admin123
    'admin',
    false,
    0.00
WHERE NOT EXISTS (
    SELECT 1 FROM public.users WHERE email = 'admin@gocine.com'
);

-- Verificar que el usuario admin fue creado
SELECT id, username, email, role, is_vip FROM public.users WHERE role = 'admin';
