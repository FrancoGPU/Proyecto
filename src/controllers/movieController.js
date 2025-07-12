const pool = require("../config/db");

module.exports = {
  getMovies: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT m.*, tr.name as room_name, tr.room_type, tr.price_multiplier
        FROM movies m
        LEFT JOIN theater_rooms tr ON m.room_id = tr.id
        ORDER BY m.id ASC
      `);
      res.json(result.rows);
    } catch (err) {
      console.error("Error al obtener las películas:", err.message);
      res.status(500).send("Error al obtener las películas");
    }
  },

  getUpcomingMovies: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT um.*, tr.name as room_name, tr.room_type
        FROM upcoming_movies um
        LEFT JOIN theater_rooms tr ON um.room_id = tr.id
        ORDER BY um.release_date ASC
      `);
      res.json(result.rows);
    } catch (err) {
      console.error("Error al obtener las películas próximas:", err.message);
      res.status(500).send("Error al obtener las películas próximas");
    }
  },

  // Obtener películas en 4D
  get4DMovies: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT m.*, tr.name as room_name, tr.room_type, tr.price_multiplier,
               tr.features, tr.description as room_description
        FROM movies m
        INNER JOIN theater_rooms tr ON m.room_id = tr.id
        WHERE tr.room_type = '4d' AND tr.is_active = true
        ORDER BY m.id ASC
      `);
      res.json(result.rows);
    } catch (err) {
      console.error("Error al obtener películas 4D:", err.message);
      res.status(500).send("Error al obtener películas 4D");
    }
  },

  // Obtener películas en estreno
  getPremieres: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT m.*, tr.name as room_name, tr.room_type, tr.price_multiplier
        FROM movies m
        LEFT JOIN theater_rooms tr ON m.room_id = tr.id
        WHERE m.is_premiere = true 
        AND (m.premiere_date IS NULL OR m.premiere_date <= CURRENT_DATE + INTERVAL '30 days')
        ORDER BY m.premiere_date DESC, m.id ASC
      `);
      res.json(result.rows);
    } catch (err) {
      console.error("Error al obtener estrenos:", err.message);
      res.status(500).send("Error al obtener estrenos");
    }
  },

  // Obtener próximos estrenos
  getComingSoon: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT um.*, tr.name as room_name, tr.room_type
        FROM upcoming_movies um
        LEFT JOIN theater_rooms tr ON um.room_id = tr.id
        WHERE um.release_date > CURRENT_DATE
        ORDER BY um.release_date ASC
        LIMIT 10
      `);
      res.json(result.rows);
    } catch (err) {
      console.error("Error al obtener próximos estrenos:", err.message);
      res.status(500).send("Error al obtener próximos estrenos");
    }
  },

  // Obtener detalles de una película específica
  getMovieDetails: async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await pool.query(`
        SELECT m.*, tr.name as room_name, tr.room_type, tr.price_multiplier,
               tr.features, tr.description as room_description, tr.capacity
        FROM movies m
        LEFT JOIN theater_rooms tr ON m.room_id = tr.id
        WHERE m.id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Película no encontrada' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error al obtener detalles de película:", err.message);
      res.status(500).send("Error al obtener detalles de película");
    }
  },

  // Obtener salas de cine
  getTheaterRooms: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT * FROM theater_rooms
        WHERE is_active = true
        ORDER BY room_type, name
      `);
      res.json(result.rows);
    } catch (err) {
      console.error("Error al obtener salas:", err.message);
      res.status(500).send("Error al obtener salas");
    }
  },

  // Configurar notificación de estreno
  notifyPremiere: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const { movieId } = req.body;
      const userId = req.session.user.id;

      // Verificar si la película existe
      const movieResult = await pool.query('SELECT * FROM upcoming_movies WHERE id = $1', [movieId]);
      
      if (movieResult.rows.length === 0) {
        return res.status(404).json({ message: 'Película no encontrada' });
      }

      // Crear o actualizar notificación
      await pool.query(`
        INSERT INTO premiere_notifications (user_id, movie_id, created_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, movie_id) DO NOTHING
      `, [userId, movieId]);

      res.json({ message: 'Notificación configurada correctamente' });
    } catch (err) {
      console.error("Error al configurar notificación:", err.message);
      res.status(500).send("Error al configurar notificación");
    }
  }
};
