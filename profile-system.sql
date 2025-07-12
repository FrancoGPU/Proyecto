-- Sistema de perfil de usuario con puntos y rangos

-- Agregar columnas de puntos y rangos a la tabla users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS user_rank VARCHAR(20) DEFAULT 'Bronze',
ADD COLUMN IF NOT EXISTS total_spent DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS birth_date DATE DEFAULT NULL;

-- Crear tabla de rangos con sus beneficios
CREATE TABLE IF NOT EXISTS user_ranks (
    id SERIAL PRIMARY KEY,
    rank_name VARCHAR(20) UNIQUE NOT NULL,
    min_points INTEGER NOT NULL,
    max_points INTEGER,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    points_multiplier DECIMAL(3,2) DEFAULT 1.00,
    description TEXT,
    rank_color VARCHAR(7) DEFAULT '#000000'
);

-- Insertar rangos predefinidos
INSERT INTO user_ranks (rank_name, min_points, max_points, discount_percentage, points_multiplier, description, rank_color) VALUES
('Bronze', 0, 499, 0.00, 1.00, 'Rango inicial para nuevos usuarios', '#CD7F32'),
('Silver', 500, 999, 5.00, 1.25, 'Primer upgrade con descuentos básicos', '#C0C0C0'),
('Gold', 1000, 2499, 10.00, 1.50, 'Rango intermedio con buenos beneficios', '#FFD700'),
('Platinum', 2500, 4999, 15.00, 1.75, 'Rango premium con excelentes beneficios', '#E5E4E2'),
('Diamond', 5000, 9999, 20.00, 2.00, 'Rango elite con máximos beneficios', '#B9F2FF'),
('VIP', 10000, NULL, 25.00, 2.50, 'Rango exclusivo VIP con beneficios únicos', '#FF6B6B')
ON CONFLICT (rank_name) DO NOTHING;

-- Crear tabla de historial de puntos
CREATE TABLE IF NOT EXISTS points_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    points_earned INTEGER NOT NULL,
    points_type VARCHAR(50) NOT NULL, -- 'purchase', 'bonus', 'referral', etc.
    reference_id INTEGER, -- ID de la compra o referencia
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Función para calcular puntos basados en compra
CREATE OR REPLACE FUNCTION calculate_points_from_purchase(purchase_amount DECIMAL, user_rank VARCHAR)
RETURNS INTEGER AS $$
DECLARE
    base_points INTEGER;
    multiplier DECIMAL;
BEGIN
    -- 1 punto por cada $1 gastado (base)
    base_points := FLOOR(purchase_amount);
    
    -- Obtener multiplicador según rango
    SELECT points_multiplier INTO multiplier 
    FROM user_ranks 
    WHERE rank_name = user_rank;
    
    IF multiplier IS NULL THEN
        multiplier := 1.00;
    END IF;
    
    RETURN FLOOR(base_points * multiplier);
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar rango del usuario
CREATE OR REPLACE FUNCTION update_user_rank(user_id INTEGER)
RETURNS VARCHAR AS $$
DECLARE
    current_points INTEGER;
    new_rank VARCHAR(20);
BEGIN
    -- Obtener puntos actuales del usuario
    SELECT points INTO current_points FROM users WHERE id = user_id;
    
    -- Determinar nuevo rango
    SELECT rank_name INTO new_rank
    FROM user_ranks
    WHERE current_points >= min_points 
    AND (max_points IS NULL OR current_points <= max_points)
    ORDER BY min_points DESC
    LIMIT 1;
    
    -- Actualizar rango del usuario
    UPDATE users SET user_rank = new_rank WHERE id = user_id;
    
    -- Si alcanza VIP, activar membresía VIP
    IF new_rank = 'VIP' THEN
        UPDATE users 
        SET is_vip = TRUE,
            vip_discount_percentage = 25.00,
            vip_membership_start = CURRENT_DATE
        WHERE id = user_id;
    END IF;
    
    RETURN new_rank;
END;
$$ LANGUAGE plpgsql;

-- Función para agregar puntos a usuario
CREATE OR REPLACE FUNCTION add_points_to_user(
    user_id INTEGER, 
    points_to_add INTEGER, 
    points_type VARCHAR, 
    reference_id INTEGER DEFAULT NULL,
    description TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    current_rank VARCHAR(20);
    new_rank VARCHAR(20);
BEGIN
    -- Obtener rango actual
    SELECT user_rank INTO current_rank FROM users WHERE id = user_id;
    
    -- Agregar puntos al usuario
    UPDATE users 
    SET points = points + points_to_add 
    WHERE id = user_id;
    
    -- Registrar en historial
    INSERT INTO points_history (user_id, points_earned, points_type, reference_id, description)
    VALUES (user_id, points_to_add, points_type, reference_id, description);
    
    -- Actualizar rango
    new_rank := update_user_rank(user_id);
    
    -- Log si cambió de rango
    IF new_rank != current_rank THEN
        INSERT INTO points_history (user_id, points_earned, points_type, description)
        VALUES (user_id, 0, 'rank_upgrade', NULL, 
                'Promoción de rango: ' || current_rank || ' -> ' || new_rank);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Crear tabla para salas 4D
CREATE TABLE IF NOT EXISTS theater_rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    room_type VARCHAR(20) DEFAULT 'standard', -- 'standard', '4d', 'imax', 'vip'
    capacity INTEGER NOT NULL,
    price_multiplier DECIMAL(3,2) DEFAULT 1.00,
    description TEXT,
    features TEXT[], -- ['4d_effects', 'premium_sound', 'reclining_seats']
    is_active BOOLEAN DEFAULT TRUE
);

-- Insertar salas de ejemplo
INSERT INTO theater_rooms (name, room_type, capacity, price_multiplier, description, features) VALUES
('Sala 1', 'standard', 120, 1.00, 'Sala estándar con sonido surround', ARRAY['surround_sound']),
('Sala 2', 'standard', 150, 1.00, 'Sala estándar grande', ARRAY['surround_sound']),
('Sala 4D Experience', '4d', 80, 1.75, 'Experiencia 4D con efectos especiales', ARRAY['4d_effects', 'motion_seats', 'environmental_effects']),
('Sala VIP', 'vip', 50, 2.00, 'Sala VIP con asientos reclinables y servicio premium', ARRAY['reclining_seats', 'premium_service', 'premium_sound']),
('Sala IMAX', 'imax', 200, 1.50, 'Pantalla IMAX con audio de alta calidad', ARRAY['imax_screen', 'premium_sound'])
ON CONFLICT DO NOTHING;

-- Actualizar tabla de películas para incluir sala
ALTER TABLE public.movies 
ADD COLUMN IF NOT EXISTS room_id INTEGER REFERENCES theater_rooms(id) DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_premiere BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS premiere_date DATE;

-- Actualizar upcoming_movies para incluir información de estreno
ALTER TABLE public.upcoming_movies 
ADD COLUMN IF NOT EXISTS is_premiere BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS room_id INTEGER REFERENCES theater_rooms(id) DEFAULT 1;

-- Crear tabla para facturas (alternativa a boletas)
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    invoice_number VARCHAR(20) UNIQUE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    invoice_type VARCHAR(20) DEFAULT 'ticket', -- 'ticket', 'combo', 'mixed'
    payment_method VARCHAR(50),
    company_name VARCHAR(255),
    company_ruc VARCHAR(20),
    company_address TEXT,
    status VARCHAR(20) DEFAULT 'paid', -- 'pending', 'paid', 'cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date DATE,
    notes TEXT
);

-- Crear tabla de items de factura
CREATE TABLE IF NOT EXISTS invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
    item_type VARCHAR(20) NOT NULL, -- 'movie', 'combo', 'service'
    item_id INTEGER, -- ID de la película o combo
    item_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    description TEXT
);

-- Función para generar número de factura
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS VARCHAR AS $$
DECLARE
    current_year VARCHAR(4);
    sequence_num INTEGER;
    invoice_num VARCHAR(20);
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE)::VARCHAR;
    
    -- Obtener siguiente número de secuencia para el año actual
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 6) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM invoices 
    WHERE invoice_number LIKE current_year || '-%';
    
    -- Formatear número de factura
    invoice_num := current_year || '-' || LPAD(sequence_num::VARCHAR, 6, '0');
    
    RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_points_history_user ON points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_points_history_type ON points_history(points_type);
CREATE INDEX IF NOT EXISTS idx_users_points ON users(points);
CREATE INDEX IF NOT EXISTS idx_users_rank ON users(user_rank);
CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_movies_premiere ON movies(is_premiere);
