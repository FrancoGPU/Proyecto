const pool = require("../config/db");

module.exports = {
  getMovies: async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM movies ORDER BY id ASC");
      res.json(result.rows);
    } catch (err) {
      console.error("Error al obtener películas:", err.message);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  },
  addMovie: async (req, res) => {
    const { title, genre, release_date, description, image, showtimes } = req.body;
    try {
      const result = await pool.query(
        "INSERT INTO movies (title, genre, release_date, description, image, showtimes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [title, genre, release_date, description, image, showtimes]
      );
      res.status(201).json({ message: "Película añadida exitosamente", movie: result.rows[0] });
    } catch (err) {
      console.error("Error al añadir película:", err.message);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  },
  updateMovie: async (req, res) => {
    const { id } = req.params;
    const { title, genre, release_date, description, image, showtimes } = req.body;
    try {
      const result = await pool.query(
        "UPDATE movies SET title = $1, genre = $2, release_date = $3, description = $4, image = $5, showtimes = $6 WHERE id = $7 RETURNING *",
        [title, genre, release_date, description, image, showtimes, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Película no encontrada." });
      }
      res.json({ message: "Película actualizada exitosamente.", movie: result.rows[0] });
    } catch (err) {
      console.error("Error al actualizar película:", err.message);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  },
  deleteMovie: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query("DELETE FROM movies WHERE id = $1 RETURNING *", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Película no encontrada." });
      }
      res.json({ message: "Película eliminada exitosamente.", movie: result.rows[0] });
    } catch (err) {
      console.error("Error al eliminar película:", err.message);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  },
  getCombos: async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM combos ORDER BY id ASC");
      res.json(result.rows);
    } catch (err) {
      console.error("Error al obtener combos:", err.message);
      res.status(500).json({ message: "Error interno del servidor al obtener combos." });
    }
  },
  addCombo: async (req, res) => {
    // Lógica para añadir combo
  },
  updateCombo: async (req, res) => {
    const { id } = req.params;
    const { name, description, price, image } = req.body;
    try {
      const result = await pool.query(
        "UPDATE combos SET name = $1, description = $2, price = $3, image = $4 WHERE id = $5 RETURNING *",
        [name, description, price, image, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Combo no encontrado." });
      }
      res.json({ message: "Combo actualizado exitosamente.", combo: result.rows[0] });
    } catch (err) {
      console.error("Error al actualizar combo:", err.message);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  },
  deleteCombo: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query("DELETE FROM combos WHERE id = $1 RETURNING *", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Combo no encontrado." });
      }
      res.json({ message: "Combo eliminado exitosamente.", combo: result.rows[0] });
    } catch (err) {
      console.error("Error al eliminar combo:", err.message);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  },
  getUsers: async (req, res) => {
    try {
      const result = await pool.query("SELECT id, username, email, role FROM users ORDER BY id ASC");
      res.json(result.rows);
    } catch (err) {
      console.error("Error al obtener usuarios:", err.message);
      res.status(500).json({ message: "Error interno del servidor al obtener usuarios." });
    }
  },
  updateUserRole: async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;
    try {
      const result = await pool.query(
        "UPDATE users SET role = $1 WHERE id = $2 RETURNING *",
        [role, userId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }
      res.json({ message: "Rol de usuario actualizado exitosamente.", user: result.rows[0] });
    } catch (err) {
      console.error("Error al actualizar rol de usuario:", err.message);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  },
  getMovieById: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query("SELECT * FROM movies WHERE id = $1", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Película no encontrada." });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error al obtener película por ID:", err.message);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  },
  getComboById: async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query("SELECT * FROM combos WHERE id = $1", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Combo no encontrado." });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error al obtener combo por ID:", err.message);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  },
};
