const pool = require('./src/config/db');

async function updateExistingAdmins() {
    const client = await pool.connect();
    try {
        // Actualizar usuarios admin existentes para establecer is_admin = true
        const result = await client.query(
            `UPDATE users 
             SET is_admin = true 
             WHERE role = 'admin' AND is_admin IS NULL`,
        );
        
        console.log(`${result.rowCount} usuarios admin actualizados con is_admin = true`);
        
        // Verificar usuarios admin
        const admins = await client.query(
            "SELECT id, username, email, role, is_admin FROM users WHERE role = 'admin'"
        );
        
        console.log('Usuarios admin en la base de datos:');
        admins.rows.forEach(admin => {
            console.log(`- ID: ${admin.id}, Email: ${admin.email}, Role: ${admin.role}, is_admin: ${admin.is_admin}`);
        });
        
    } catch (error) {
        console.error('Error al actualizar usuarios admin:', error);
    } finally {
        client.release();
        process.exit();
    }
}

updateExistingAdmins();
