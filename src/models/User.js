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
};
