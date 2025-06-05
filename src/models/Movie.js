const pool = require("../config/db");

module.exports = {
  findAll: async () => {
    try {
      const result = await pool.query("SELECT * FROM movies ORDER BY id ASC");
      return result.rows;
    } catch (err) {
      console.error("Error al obtener todas las películas:", err.message);
      throw err;
    }
  },
  findById: async (id) => {
    // Lógica para obtener película por ID
  },
  create: async (movieData) => {
    try {
      const result = await pool.query(
        "INSERT INTO movies (title, genre, release_date, description, image, showtimes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [movieData.title, movieData.genre, movieData.release_date, movieData.description, movieData.image, movieData.showtimes]
      );
      return result.rows[0];
    } catch (err) {
      console.error("Error al crear película:", err.message);
      throw err;
    }
  },
  update: async (id, movieData) => {
    // Lógica para actualizar película
  },
  delete: async (id) => {
    // Lógica para eliminar película
  },
};
