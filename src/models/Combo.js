const pool = require("../config/db");

module.exports = {
  findAll: async () => {
    try {
      const result = await pool.query("SELECT * FROM combos ORDER BY id ASC");
      return result.rows;
    } catch (err) {
      console.error("Error al obtener todos los combos:", err.message);
      throw err;
    }
  },
  findById: async (id) => {
    // Lógica para obtener combo por ID
  },
  create: async (comboData) => {
    try {
      const result = await pool.query(
        "INSERT INTO combos (name, description, price, image) VALUES ($1, $2, $3, $4) RETURNING *",
        [comboData.name, comboData.description, comboData.price, comboData.image]
      );
      return result.rows[0];
    } catch (err) {
      console.error("Error al crear combo:", err.message);
      throw err;
    }
  },
  update: async (id, comboData) => {
    // Lógica para actualizar combo
  },
  delete: async (id) => {
    // Lógica para eliminar combo
  },
};
