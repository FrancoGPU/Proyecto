-- Crear tabla para registrar las compras
CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    movie_title VARCHAR(255) NOT NULL,
    showtime VARCHAR(100),
    selected_seats TEXT,
    ticket_price DECIMAL(10, 2) DEFAULT 0,
    cart_items JSONB DEFAULT '[]',
    total_original DECIMAL(10, 2) NOT NULL,
    total_final DECIMAL(10, 2) NOT NULL,
    discount_applied DECIMAL(5, 2) DEFAULT 0,
    is_vip_purchase BOOLEAN DEFAULT FALSE,
    payment_method VARCHAR(50) DEFAULT 'credit_card',
    card_last_four VARCHAR(4),
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    purchase_id VARCHAR(50) UNIQUE NOT NULL
);

-- Crear índices para mejorar las consultas
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(purchase_date);
CREATE INDEX IF NOT EXISTS idx_purchases_purchase_id ON purchases(purchase_id);

-- Comentarios para documentar la tabla
COMMENT ON TABLE purchases IS 'Tabla para almacenar todas las compras realizadas en el sistema';
COMMENT ON COLUMN purchases.user_id IS 'ID del usuario que realizó la compra (puede ser NULL para compras de invitados)';
COMMENT ON COLUMN purchases.cart_items IS 'Items del carrito en formato JSON (combos, productos adicionales)';
COMMENT ON COLUMN purchases.total_original IS 'Precio total original sin descuentos';
COMMENT ON COLUMN purchases.total_final IS 'Precio total final con descuentos aplicados';
COMMENT ON COLUMN purchases.discount_applied IS 'Porcentaje de descuento aplicado';
COMMENT ON COLUMN purchases.purchase_id IS 'ID único de la compra generado por la aplicación';
