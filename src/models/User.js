const pool = require("../config/db");

module.exports = {
  findByEmail: async (email) => {
    try {
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      return result.rows[0];
    } catch (err) {
      console.error("Error al buscar usuario por email:", err.message);
      throw err;
    }
  },
  findByUsername: async (username) => {
    // Lógica para buscar usuario por username
  },
  create: async (userData) => {
    try {
      const result = await pool.query(
        "INSERT INTO users (email, password, username, role) VALUES ($1, $2, $3, $4) RETURNING *",
        [userData.email, userData.password, userData.username, userData.role]
      );
      return result.rows[0];
    } catch (err) {
      console.error("Error al crear usuario:", err.message);
      throw err;
    }
  },
  updatePassword: async (userId, newPassword) => {
    // Lógica para actualizar contraseña
  },
  
  // Nuevas funciones para usuarios VIP
  findById: async (userId) => {
    try {
      const result = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
      return result.rows[0];
    } catch (err) {
      console.error("Error al buscar usuario por ID:", err.message);
      throw err;
    }
  },

  isVipActive: async (userId) => {
    try {
      const result = await pool.query(
        "SELECT is_vip_active($1) as is_active",
        [userId]
      );
      return result.rows[0]?.is_active || false;
    } catch (err) {
      console.error("Error al verificar estado VIP:", err.message);
      return false;
    }
  },

  getVipDiscount: async (userId) => {
    try {
      const result = await pool.query(
        `SELECT vip_discount_percentage 
         FROM users 
         WHERE id = $1 
         AND is_vip = TRUE 
         AND (vip_membership_end IS NULL OR vip_membership_end >= CURRENT_DATE)`,
        [userId]
      );
      return result.rows[0]?.vip_discount_percentage || 0;
    } catch (err) {
      console.error("Error al obtener descuento VIP:", err.message);
      return 0;
    }
  },

  upgradeToVip: async (userId, discountPercentage = 15.00, membershipDurationMonths = 12) => {
    try {
      const membershipEnd = membershipDurationMonths ? 
        `CURRENT_DATE + INTERVAL '${membershipDurationMonths} months'` : 
        'NULL';
      
      const result = await pool.query(
        `UPDATE users 
         SET is_vip = TRUE, 
             vip_discount_percentage = $2,
             vip_membership_start = CURRENT_DATE,
             vip_membership_end = ${membershipEnd}
         WHERE id = $1 
         RETURNING *`,
        [userId, discountPercentage]
      );
      return result.rows[0];
    } catch (err) {
      console.error("Error al actualizar usuario a VIP:", err.message);
      throw err;
    }
  },

  removeVipStatus: async (userId) => {
    try {
      const result = await pool.query(
        `UPDATE users 
         SET is_vip = FALSE, 
             vip_discount_percentage = 0.00,
             vip_membership_end = CURRENT_DATE
         WHERE id = $1 
         RETURNING *`,
        [userId]
      );
      return result.rows[0];
    } catch (err) {
      console.error("Error al remover estado VIP:", err.message);
      throw err;
    }
  }
};
