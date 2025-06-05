const pool = require("../config/db");

module.exports = {
  getMovies: async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM movies ORDER BY id ASC");
      res.json(result.rows);
    } catch (err) {
      console.error("Error al obtener las películas:", err.message);
      res.status(500).send("Error al obtener las películas");
    }
  },
  getUpcomingMovies: async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM upcoming_movies ORDER BY id ASC");
      res.json(result.rows);
    } catch (err) {
      console.error("Error al obtener las películas próximas:", err.message);
      res.status(500).send("Error al obtener las películas próximas");
    }
  },
};
