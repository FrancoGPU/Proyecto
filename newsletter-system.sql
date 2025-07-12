-- Sistema de Newsletter para Estrenos
-- Crear tabla para suscripciones de newsletter
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{"premieres": true, "promotions": true, "events": false}',
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_email_sent TIMESTAMP,
    unsubscribe_token VARCHAR(255) UNIQUE
);

-- Crear tabla para notificaciones de estrenos
CREATE TABLE IF NOT EXISTS premiere_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    movie_id INTEGER REFERENCES upcoming_movies(id) ON DELETE CASCADE,
    notified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notified_at TIMESTAMP,
    UNIQUE(user_id, movie_id)
);

-- Función para generar token de desuscripción
CREATE OR REPLACE FUNCTION generate_unsubscribe_token()
RETURNS VARCHAR(255) AS $$
BEGIN
    RETURN md5(random()::text || clock_timestamp()::text);
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar token automáticamente
CREATE OR REPLACE FUNCTION set_unsubscribe_token()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.unsubscribe_token IS NULL THEN
        NEW.unsubscribe_token := generate_unsubscribe_token();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS newsletter_token_trigger ON newsletter_subscriptions;
CREATE TRIGGER newsletter_token_trigger
    BEFORE INSERT ON newsletter_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION set_unsubscribe_token();

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_premiere_notifications_user ON premiere_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_premiere_notifications_movie ON premiere_notifications(movie_id);

-- Función para suscribir al newsletter
CREATE OR REPLACE FUNCTION subscribe_to_newsletter(
    p_email VARCHAR(255),
    p_name VARCHAR(100) DEFAULT NULL,
    p_preferences JSONB DEFAULT '{"premieres": true, "promotions": true, "events": false}'
)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
    v_existing_id INTEGER;
BEGIN
    -- Verificar si ya existe
    SELECT id INTO v_existing_id 
    FROM newsletter_subscriptions 
    WHERE email = p_email;
    
    IF v_existing_id IS NOT NULL THEN
        -- Reactivar si estaba inactivo
        UPDATE newsletter_subscriptions
        SET is_active = true,
            name = COALESCE(p_name, name),
            preferences = p_preferences,
            subscribed_at = CURRENT_TIMESTAMP
        WHERE id = v_existing_id;
        
        v_result := jsonb_build_object(
            'success', true,
            'message', 'Suscripción reactivada correctamente',
            'action', 'reactivated'
        );
    ELSE
        -- Crear nueva suscripción
        INSERT INTO newsletter_subscriptions (email, name, preferences)
        VALUES (p_email, p_name, p_preferences);
        
        v_result := jsonb_build_object(
            'success', true,
            'message', 'Suscripción creada correctamente',
            'action', 'created'
        );
    END IF;
    
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Error al procesar suscripción: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql;

-- Función para desuscribir del newsletter
CREATE OR REPLACE FUNCTION unsubscribe_from_newsletter(p_token VARCHAR(255))
RETURNS JSONB AS $$
DECLARE
    v_affected_rows INTEGER;
BEGIN
    UPDATE newsletter_subscriptions
    SET is_active = false
    WHERE unsubscribe_token = p_token;
    
    GET DIAGNOSTICS v_affected_rows = ROW_COUNT;
    
    IF v_affected_rows > 0 THEN
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Desuscripción realizada correctamente'
        );
    ELSE
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Token de desuscripción inválido o expirado'
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Insertar algunos datos de ejemplo
INSERT INTO newsletter_subscriptions (email, name, preferences) VALUES
('usuario1@example.com', 'Usuario Demo', '{"premieres": true, "promotions": false, "events": true}'),
('cinefilo@example.com', 'Cinéfilo Apasionado', '{"premieres": true, "promotions": true, "events": true}')
ON CONFLICT (email) DO NOTHING;

COMMENT ON TABLE newsletter_subscriptions IS 'Tabla para gestionar suscripciones al newsletter de la aplicación';
COMMENT ON TABLE premiere_notifications IS 'Tabla para gestionar notificaciones personalizadas de estrenos por usuario';
