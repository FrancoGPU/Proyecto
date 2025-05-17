const express = require("express");
const path = require("path");
const pool = require("./db"); // Importa la conexión a PostgreSQL
const bcrypt = require("bcrypt"); // Importa bcrypt para encriptar contraseñas
const nodemailer = require("nodemailer"); // Importa nodemailer para enviar correos electrónicos
const crypto = require('crypto'); // Para generar tokens seguros
const session = require('express-session'); // Para manejar sesiones
const pgSession = require('connect-pg-simple')(session); // Para almacenar sesiones en PostgreSQL

// Configuración del transporter de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '1gocine12@gmail.com', // Tu dirección de Gmail
    pass: 'dwcc haia lsur xqor' // La contraseña de aplicación que generaste
  }
});

const app = express();
const PORT = 3000;

// Middleware para procesar JSON en las solicitudes
app.use(express.json());

// Middleware para procesar datos de formularios URL-encoded
app.use(express.urlencoded({ extended: true }));

// Middleware para servir archivos estáticos desde el directorio 'src'
app.use(express.static(path.join(__dirname, "src")));

// Configuración de Sesiones
app.use(session({
  store: new pgSession({
    pool: pool, // Reutiliza tu pool de conexión existente
    tableName: 'user_sessions', // Nombre de la tabla para sesiones (asegúrate que exista)
    createTableIfMissing: true // Opcional: Intentará crear la tabla si no existe
  }),
  secret: 'GOCINE123456', // ¡¡¡CAMBIA ESTO POR UN SECRETO FUERTE Y ÚNICO!!!
  resave: false, // No guardar la sesión si no se modificó
  saveUninitialized: false, // No crear sesión hasta que algo se almacene
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true en producción (requiere HTTPS)
    httpOnly: true, // Previene acceso a la cookie desde JS en el cliente
    maxAge: 1000 * 60 * 60 * 24 // 1 día de duración para la cookie de sesión
  }
}));

// --- Middleware de Autenticación de Administrador ---
const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next(); // El usuario está autenticado y es administrador
  } else if (req.session && req.session.user) {
    // El usuario está autenticado pero no es administrador
    return res.status(403).json({ message: 'Acceso denegado. Se requieren privilegios de administrador.' });
  } else {
    // El usuario no está autenticado
    return res.status(401).json({ message: 'No autenticado. Por favor, inicia sesión.' });
  }
};


// --- Endpoints Públicos ---

app.get("/api/movies", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM movies ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener las películas:", err.message);
    res.status(500).send("Error al obtener las películas");
  }
});

app.get("/api/upcoming", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM upcoming_movies ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener las películas próximas:", err.message);
    res.status(500).send("Error al obtener las películas próximas");
  }
});

app.get("/api/combos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM combos ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener los combos:", err.message);
    res.status(500).send("Error al obtener los combos");
  }
});

app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Correo y contraseña son requeridos." });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres." });
  }

  try {
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "El correo ya está registrado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // La columna 'role' tomará el valor 'usuario' por defecto si así se definió en la BD
    // o puedes especificarlo:
    const newUser = await pool.query(
      "INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role",
      [email, hashedPassword, 'usuario'] // Asigna 'usuario' por defecto
    );
    // No iniciar sesión automáticamente al registrar, o si lo haces, crea la sesión aquí.
    res.status(201).json({ message: "Usuario registrado exitosamente." });
  } catch (err) {
    console.error("Error al registrar el usuario:", err.message);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Correo y contraseña son requeridos." });
  }

  try {
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "Correo o contraseña incorrectos." });
    }

    const user = userResult.rows[0]; // Este es tu usuario autenticado
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Correo o contraseña incorrectos." });
    }

    // Crear la sesión del usuario
    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role 
    };
    req.session.loggedIn = true; // Asegúrate de establecer loggedIn en true

    console.log('Login exitoso para:', user.email, 'Rol:', user.role); // Log para depuración
    res.status(200).json({
        success: true, // Es buena práctica incluir un booleano de éxito
        message: "Inicio de sesión exitoso.",
        user: { 
            id: user.id,
            email: user.email,
            role: user.role
        }
    });

  } catch (err) {
    console.error("Error al iniciar sesión:", err.message);
    res.status(500).json({ success: false, message: "Error interno del servidor." });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Error al cerrar sesión:", err);
      return res.status(500).json({ message: 'No se pudo cerrar la sesión.' });
    }
    res.clearCookie('connect.sid'); // Nombre de la cookie por defecto para express-session
    res.status(200).json({ message: 'Cierre de sesión exitoso.' });
  });
});


app.post('/api/recuperar', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Correo electrónico es requerido." });
  }
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      // No revelar si el correo existe o no por seguridad
      return res.json({ message: 'Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.' });
    }

    const user = userResult.rows[0];
    const recoveryToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hora

    await pool.query(
      'UPDATE users SET recovery_token = $1, recovery_token_expires_at = $2 WHERE id = $3',
      [recoveryToken, expiresAt, user.id]
    );

    const recoveryLink = `http://localhost:${PORT}/paginas/restablecer-contrasena.html?token=${recoveryToken}`;

    const mailOptions = {
      from: '1gocine12@gmail.com',
      to: email,
      subject: 'Restablecimiento de Contraseña - GOCINE',
      text: `Hola ${user.email},\n\nHas solicitado restablecer tu contraseña para GOCINE.\nPor favor, haz clic en el siguiente enlace o cópialo en tu navegador para completar el proceso (el enlace expira en 1 hora):\n\n${recoveryLink}\n\nSi no solicitaste esto, por favor ignora este correo.\n\nGracias,\nEl equipo de GOCINE`,
      html: `<p>Hola ${user.email},</p><p>Has solicitado restablecer tu contraseña para GOCINE.</p><p>Por favor, haz clic en el siguiente enlace o cópialo en tu navegador para completar el proceso (el enlace expira en 1 hora):</p><p><a href="${recoveryLink}">${recoveryLink}</a></p><p>Si no solicitaste esto, por favor ignora este correo.</p><p>Gracias,<br>El equipo de GOCINE</p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error al enviar el correo de recuperación:', error);
        // No informar al usuario del error interno específico, solo un mensaje genérico
        return res.status(500).json({ message: 'Error al procesar la solicitud. Inténtalo de nuevo más tarde.' });
      }
      console.log('Correo de recuperación enviado: %s', info.messageId);
      res.json({ message: 'Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.' });
    });

  } catch (err) {
    console.error('Error en /api/recuperar:', err.message);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

app.post('/api/restablecer-contrasena', async (req, res) => {
  const { token, nuevaPassword } = req.body;

  if (!token || !nuevaPassword) {
    return res.status(400).json({ message: 'Token y nueva contraseña son requeridos.' });
  }
  if (nuevaPassword.length < 6) {
    return res.status(400).json({ message: "La nueva contraseña debe tener al menos 6 caracteres." });
  }

  try {
    const userResult = await pool.query(
      'SELECT * FROM users WHERE recovery_token = $1 AND recovery_token_expires_at > NOW()',
      [token]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Token inválido o expirado.' });
    }

    const user = userResult.rows[0];
    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

    await pool.query(
      'UPDATE users SET password = $1, recovery_token = NULL, recovery_token_expires_at = NULL WHERE id = $2',
      [hashedPassword, user.id]
    );

    res.json({ message: 'Contraseña restablecida exitosamente.' });

  } catch (err) {
    console.error('Error en /api/restablecer-contrasena:', err.message);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// Endpoint para verificar el estado de la sesión (útil para el frontend)
app.get('/api/session/status', (req, res) => {
    if (req.session.loggedIn && req.session.user) {
        res.json({ 
            loggedIn: true, 
            user: req.session.user 
        });
    } else {
        res.json({ loggedIn: false });
    }
});


// --- Endpoints de Administración (Protegidos por isAdmin) ---

app.get("/api/admin/movies", isAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM movies ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener películas para admin:", err.message);
    res.status(500).send("Error interno del servidor");
  }
});

app.get("/api/admin/movies/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM movies WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Película no encontrada" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error al obtener la película para editar:", err.message);
    res.status(500).send("Error interno del servidor");
  }
});

app.post("/api/admin/movies", isAdmin, async (req, res) => {
  const { title, description, image, release_date, director, duration_minutes, genre, trailer_url, rating } = req.body;
  if (!title || !description) {
    return res.status(400).json({ message: "Título y descripción son requeridos." });
  }
  try {
    const result = await pool.query(
      `INSERT INTO movies (title, description, image, release_date, director, duration_minutes, genre, trailer_url, rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, description, image, release_date, director, duration_minutes, genre, trailer_url, rating]
    );
    res.status(201).json({ message: "Película añadida exitosamente", movie: result.rows[0] });
  } catch (err) {
    console.error("Error al añadir la película:", err.message);
    res.status(500).send("Error interno del servidor");
  }
});

app.put("/api/admin/movies/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, description, image, release_date, director, duration_minutes, genre, trailer_url, rating } = req.body;
  if (!title || !description) {
    return res.status(400).json({ message: "Título y descripción son requeridos." });
  }
  try {
    const result = await pool.query(
      `UPDATE movies
       SET title = $1, description = $2, image = $3, release_date = $4, director = $5,
           duration_minutes = $6, genre = $7, trailer_url = $8, rating = $9
       WHERE id = $10
       RETURNING *`,
      [title, description, image, release_date, director, duration_minutes, genre, trailer_url, rating, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Película no encontrada para actualizar" });
    }
    res.json({ message: "Película actualizada exitosamente", movie: result.rows[0] });
  } catch (err) {
    console.error("Error al actualizar la película:", err.message);
    res.status(500).send("Error interno del servidor");
  }
});

app.delete("/api/admin/movies/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM movies WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Película no encontrada para eliminar" });
    }
    res.json({ message: "Película eliminada exitosamente", movie: result.rows[0] });
  } catch (err) {
    console.error("Error al eliminar la película:", err.message);
    res.status(500).send("Error interno del servidor");
  }
});

// --- Endpoints CRUD para Combos (Protegidos por isAdmin) ---

// GET todos los combos
app.get('/api/admin/combos', isAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM combos ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener combos:', err.message);
    res.status(500).json({ message: 'Error interno del servidor al obtener combos.' });
  }
});

// GET un combo por ID
app.get('/api/admin/combos/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM combos WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Combo no encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error al obtener combo ${id}:`, err.message);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// POST crear un nuevo combo
app.post('/api/admin/combos', isAdmin, async (req, res) => {
  const { name, description, price, image } = req.body;
  if (!name || !description || price === undefined) { // price puede ser 0
    return res.status(400).json({ message: 'Nombre, descripción y precio son requeridos.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO combos (name, description, price, image) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, parseFloat(price), image]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear combo:', err.message);
    res.status(500).json({ message: 'Error interno del servidor al crear el combo.' });
  }
});

// PUT actualizar un combo existente
app.put('/api/admin/combos/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image } = req.body;
   if (!name || !description || price === undefined) {
    return res.status(400).json({ message: 'Nombre, descripción y precio son requeridos.' });
  }
  try {
    const result = await pool.query(
      'UPDATE combos SET name = $1, description = $2, price = $3, image = $4 WHERE id = $5 RETURNING *',
      [name, description, parseFloat(price), image, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Combo no encontrado para actualizar.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error al actualizar combo ${id}:`, err.message);
    res.status(500).json({ message: 'Error interno del servidor al actualizar el combo.' });
  }
});

// DELETE eliminar un combo
app.delete('/api/admin/combos/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM combos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Combo no encontrado para eliminar.' });
    }
    res.status(200).json({ message: 'Combo eliminado exitosamente.', combo: result.rows[0] });
  } catch (err) {
    console.error(`Error al eliminar combo ${id}:`, err.message);
    res.status(500).json({ message: 'Error interno del servidor al eliminar el combo.' });
  }
});


// --- Ruta Principal y Manejadores de Error ---

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src/paginas/index.html")); // Ajusta a tu página de inicio
});

// Middleware para manejar rutas no encontradas (404)
// Debe ir después de todas tus rutas específicas
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'src/paginas/404.html'));
});

// Middleware de manejo de errores global
// Debe ser el último middleware
app.use((err, req, res, next) => {
  console.error("Error global no manejado:", err.stack);
  // Evitar enviar el stack de error al cliente en producción por seguridad
  const statusCode = err.status || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500 
                  ? 'Algo salió mal en el servidor!' 
                  : err.message || 'Error interno del servidor';
  res.status(statusCode).json({ message: message });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});