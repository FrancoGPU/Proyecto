const bcrypt = require('bcrypt');
const pool = require('./src/config/db');

async function createAdminUser() {
    const client = await pool.connect();
    try {
        // Hash para la contraseña 'admin123'
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        // Verificar si ya existe un usuario admin
        const existingAdmin = await client.query(
            "SELECT id FROM users WHERE email = $1",
            ['admin@gocine.com']
        );
        
        if (existingAdmin.rows.length > 0) {
            console.log('Usuario admin ya existe');
            return;
        }
        
        // Crear usuario admin
        const result = await client.query(
            `INSERT INTO users (username, email, password, role, is_vip, vip_discount_percentage)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, username, email, role`,
            ['admin', 'admin@gocine.com', hashedPassword, 'admin', false, 0.00]
        );
        
        console.log('Usuario admin creado exitosamente:', result.rows[0]);
        console.log('Credenciales: admin@gocine.com / admin123');
        
    } catch (error) {
        console.error('Error al crear usuario admin:', error);
    } finally {
        client.release();
        process.exit();
    }
}

createAdminUser();
