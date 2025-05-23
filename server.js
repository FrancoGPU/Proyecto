const express = require("express");
const path = require("path");
const pool = require("./db"); // Importa la conexión a PostgreSQL
const bcrypt = require("bcrypt"); // Importa bcrypt para encriptar contraseñas
const nodemailer = require("nodemailer"); // Importa nodemailer para enviar correos electrónicos
const crypto = require("crypto"); // Para generar tokens seguros
const session = require("express-session"); // Para manejar sesiones
const pgSession = require("connect-pg-simple")(session); // Para almacenar sesiones en PostgreSQL

// Configuración del transporter de Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "1gocine12@gmail.com",
    pass: "dwcc haia lsur xqor",
  },
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
app.use(
  session({
    store: new pgSession({
      pool: pool, // Reutiliza tu pool de conexión existente
      tableName: "user_sessions", // Nombre de la tabla para sesiones (asegúrate que exista)
      createTableIfMissing: true, // Opcional: Intentará crear la tabla si no existe
    }),
    secret: "GOCINE123456",
    resave: false, // No guardar la sesión si no se modificó
    saveUninitialized: false, // No crear sesión hasta que algo se almacene
    cookie: {
      secure: process.env.NODE_ENV === "production", // true en producción (requiere HTTPS)
      httpOnly: true, // Previene acceso a la cookie desde JS en el cliente
      maxAge: 1000 * 60 * 60 * 24, // 1 día de duración para la cookie de sesión
    },
  })
);

// --- Middleware de Autenticación de Administrador ---
const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === "admin") {
    return next(); // El usuario está autenticado y es administrador
  } else if (req.session && req.session.user) {
    // El usuario está autenticado pero no es administrador
    return res.status(403).json({
      message: "Acceso denegado. Se requieren privilegios de administrador.",
    });
  } else {
    // El usuario no está autenticado
    return res
      .status(401)
      .json({ message: "No autenticado. Por favor, inicia sesión." });
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
    const result = await pool.query(
      "SELECT * FROM upcoming_movies ORDER BY id ASC"
    );
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
  const { email, password, username } = req.body; // Añadir username

  if (!email || !password || !username) {
    // Validar username
    return res.status(400).json({
      message: "Nombre de usuario, correo y contraseña son requeridos.",
    });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "La contraseña debe tener al menos 6 caracteres." });
  }
  if (username.length < 3 || username.length > 50) {
    return res.status(400).json({
      message: "El nombre de usuario debe tener entre 3 y 50 caracteres.",
    });
  }
  // Validar que el username no contenga espacios o caracteres especiales (opcional, pero recomendado)
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({
      message:
        "El nombre de usuario solo puede contener letras, números y guiones bajos (_).",
    });
  }

  try {
    const existingUserByEmail = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existingUserByEmail.rows.length > 0) {
      return res.status(400).json({ message: "El correo ya está registrado." });
    }

    const existingUserByUsername = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    ); // Verificar username
    if (existingUserByUsername.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "El nombre de usuario ya está en uso." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      "INSERT INTO users (email, password, username, role) VALUES ($1, $2, $3, $4) RETURNING id, email, username, role", // Añadir username
      [email, hashedPassword, username, "usuario"]
    );
    res.status(201).json({ message: "Usuario registrado exitosamente." });
  } catch (err) {
    console.error("Error al registrar el usuario:", err.message);
    if (err.code === "23505") {
      // Código de error para violación de unicidad en PostgreSQL
      if (err.constraint && err.constraint.includes("username")) {
        return res
          .status(400)
          .json({ message: "El nombre de usuario ya está en uso." });
      }
      if (err.constraint && err.constraint.includes("email")) {
        return res
          .status(400)
          .json({ message: "El correo electrónico ya está registrado." });
      }
    }
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email y contraseña son requeridos." });
  }
  try {
    const result = await pool.query(
      "SELECT id, username, email, password, role FROM users WHERE email = $1", // Añadido username a la selección
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }
    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }
    req.session.user = {
      id: user.id,
      email: user.email,
      username: user.username, // Guardar username en la sesión
      role: user.role,
    };
    res.json({
      message: "Inicio de sesión exitoso.",
      user: {
        id: user.id,
        email: user.email,
        username: user.username, // Devolver username en la respuesta de login
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Error en el inicio de sesión:", err.message);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

//Fin

app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error al cerrar sesión:", err);
      return res.status(500).json({ message: "No se pudo cerrar la sesión." });
    }
    res.clearCookie("connect.sid"); // Nombre de la cookie por defecto para express-session
    res.status(200).json({ message: "Cierre de sesión exitoso." });
  });
});

app.post("/api/recuperar", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({ message: "Correo electrónico es requerido." });
  }
  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userResult.rows.length === 0) {
      // No revelar si el correo existe o no por seguridad
      return res.json({
        message:
          "Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.",
      });
    }

    const user = userResult.rows[0];
    const recoveryToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hora

    await pool.query(
      "UPDATE users SET recovery_token = $1, recovery_token_expires_at = $2 WHERE id = $3",
      [recoveryToken, expiresAt, user.id]
    );

    const recoveryLink = `http://localhost:${PORT}/paginas/restablecer-contrasena.html?token=${recoveryToken}`;

    const mailOptions = {
      from: "1gocine12@gmail.com",
      to: email,
      subject: "Restablecimiento de Contraseña - GOCINE",
      text: `Hola ${user.email},\n\nHas solicitado restablecer tu contraseña para GOCINE.\nPor favor, haz clic en el siguiente enlace o cópialo en tu navegador para completar el proceso (el enlace expira en 1 hora):\n\n${recoveryLink}\n\nSi no solicitaste esto, por favor ignora este correo.\n\nGracias,\nEl equipo de GOCINE`,
      html: `<p>Hola ${user.email},</p><p>Has solicitado restablecer tu contraseña para GOCINE.</p><p>Por favor, haz clic en el siguiente enlace o cópialo en tu navegador para completar el proceso (el enlace expira en 1 hora):</p><p><a href="${recoveryLink}">${recoveryLink}</a></p><p>Si no solicitaste esto, por favor ignora este correo.</p><p>Gracias,<br>El equipo de GOCINE</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error al enviar el correo de recuperación:", error);
        // No informar al usuario del error interno específico, solo un mensaje genérico
        return res.status(500).json({
          message:
            "Error al procesar la solicitud. Inténtalo de nuevo más tarde.",
        });
      }
      console.log("Correo de recuperación enviado: %s", info.messageId);
      res.json({
        message:
          "Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.",
      });
    });
  } catch (err) {
    console.error("Error en /api/recuperar:", err.message);
    res
      .status(500)
      .json({ message: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA." });
  }
});

app.post("/api/restablecer-contrasena", async (req, res) => {
  const { token, nuevaPassword } = req.body;

  if (!token || !nuevaPassword) {
    return res
      .status(400)
      .json({ message: "Token y nueva contraseña son requeridos." });
  }
  if (nuevaPassword.length < 6) {
    return res.status(400).json({
      message: "La nueva contraseña debe tener al menos 6 caracteres.",
    });
  }

  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE recovery_token = $1 AND recovery_token_expires_at > NOW()",
      [token]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Token inválido o expirado." });
    }

    const user = userResult.rows[0];
    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

    await pool.query(
      "UPDATE users SET password = $1, recovery_token = NULL, recovery_token_expires_at = NULL WHERE id = $2",
      [hashedPassword, user.id]
    );

    res.json({ message: "Contraseña restablecida exitosamente." });
  } catch (err) {
    console.error("Error en /api/restablecer-contrasena:", err.message);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Endpoint para verificar el estado de la sesión (útil para el frontend)
app.get("/api/session/status", (req, res) => {
  if (req.session.user) {
    res.json({
      loggedIn: true,
      user: {
        id: req.session.user.id,
        email: req.session.user.email,
        username: req.session.user.username, // Asegurar que username se envía
        role: req.session.user.role,
      },
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
  const { title, genre, release_date, description, image, showtimes } =
    req.body;
  if (!title || !description) {
    return res
      .status(400)
      .json({ message: "Título y descripción son requeridos." });
  }
  try {
    const result = await pool.query(
      `INSERT INTO movies (title, genre, release_date, description, image, showtimes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, genre, release_date, description, image, showtimes] // showtimes se envía como array desde admin.js
    );
    res.status(201).json({
      message: "Película añadida exitosamente",
      movie: result.rows[0],
    });
  } catch (err) {
    console.error("Error al añadir la película:", err.message);
    // Enviar respuesta JSON en caso de error también
    res
      .status(500)
      .json({ message: "Error interno del servidor al añadir la película." });
  }
});

app.put("/api/admin/movies/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, genre, release_date, description, image, showtimes } =
    req.body;
  if (!title || !description) {
    return res
      .status(400)
      .json({ message: "Título y descripción son requeridos." });
  }
  try {
    // Consulta SQL corregida:
    // 1. "SETtitle" corregido a "SET title".
    // 2. Placeholders de parámetros corregidos: showtimes es $6, id es $7.
    const result = await pool.query(
      `UPDATE movies
       SET title = $1, genre = $2, release_date = $3, description = $4, image = $5, showtimes = $6
       WHERE id = $7
       RETURNING *`,
      [title, genre, release_date, description, image, showtimes, id] // showtimes se envía como array desde admin.js
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Película no encontrada para actualizar" });
    }
    res.json({
      message: "Película actualizada exitosamente",
      movie: result.rows[0],
    });
  } catch (err) {
    console.error("Error al actualizar la película:", err.message);
    // Enviar respuesta JSON en caso de error también
    res.status(500).json({
      message: "Error interno del servidor al actualizar la película.",
    });
  }
});

app.delete("/api/admin/movies/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM movies WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Película no encontrada para eliminar" });
    }
    res.json({
      message: "Película eliminada exitosamente",
      movie: result.rows[0],
    });
  } catch (err) {
    console.error("Error al eliminar la película:", err.message);
    res.status(500).send("Error interno del servidor");
  }
});

// --- Endpoints CRUD para Combos (Protegidos por isAdmin) ---

// GET todos los combos
app.get("/api/admin/combos", isAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM combos ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener combos:", err.message);
    res
      .status(500)
      .json({ message: "Error interno del servidor al obtener combos." });
  }
});

// GET un combo por ID
app.get("/api/admin/combos/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM combos WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Combo no encontrado." });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error al obtener combo ${id}:`, err.message);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

// POST crear un nuevo combo
app.post("/api/admin/combos", isAdmin, async (req, res) => {
  const { name, description, price, image } = req.body;
  if (!name || !description || price === undefined) {
    // price puede ser 0
    return res
      .status(400)
      .json({ message: "Nombre, descripción y precio son requeridos." });
  }
  try {
    const result = await pool.query(
      "INSERT INTO combos (name, description, price, image) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, description, parseFloat(price), image]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error al crear combo:", err.message);
    res
      .status(500)
      .json({ message: "Error interno del servidor al crear el combo." });
  }
});

// PUT actualizar un combo existente
app.put("/api/admin/combos/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image } = req.body;
  if (!name || !description || price === undefined) {
    return res
      .status(400)
      .json({ message: "Nombre, descripción y precio son requeridos." });
  }
  try {
    const result = await pool.query(
      "UPDATE combos SET name = $1, description = $2, price = $3, image = $4 WHERE id = $5 RETURNING *",
      [name, description, parseFloat(price), image, id]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Combo no encontrado para actualizar." });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error al actualizar combo ${id}:`, err.message);
    res
      .status(500)
      .json({ message: "Error interno del servidor al actualizar el combo." });
  }
});

// DELETE eliminar un combo
app.delete("/api/admin/combos/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM combos WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Combo no encontrado para eliminar." });
    }
    res.status(200).json({
      message: "Combo eliminado exitosamente.",
      combo: result.rows[0],
    });
  } catch (err) {
    console.error(`Error al eliminar combo ${id}:`, err.message);
    res
      .status(500)
      .json({ message: "Error interno del servidor al eliminar el combo." });
  }
});

// --- Endpoints de Administración de Usuarios (Protegidos por isAdmin) ---

// GET todos los usuarios (para administración)
// GET todos los usuarios (para administración)
app.get("/api/admin/users", isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, role FROM users ORDER BY id ASC"
    ); // Añadir username
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener usuarios para admin:", err.message);
    res
      .status(500)
      .json({ message: "Error interno del servidor al obtener usuarios." });
  }
});

// PUT actualizar el rol de un usuario
app.put("/api/admin/users/:userId/role", isAdmin, async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  // Validar que el rol sea "admin" o "usuario"
  if (!role || (role !== "admin" && role !== "usuario")) {
    return res
      .status(400)
      .json({ message: "Rol inválido. Debe ser 'admin' o 'usuario'." });
  }

  if (req.session.user && parseInt(userId, 10) === req.session.user.id) {
    return res.status(403).json({
      message: "No puedes cambiar tu propio rol a través de esta interfaz.",
    });
  }

  try {
    const result = await pool.query(
      "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, email, role",
      [role, userId]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Usuario no encontrado para actualizar rol." });
    }
    res.json({
      message: "Rol del usuario actualizado exitosamente.",
      user: result.rows[0],
    });
  } catch (err) {
    console.error(
      `Error al actualizar rol del usuario ${userId}:`,
      err.message
    );
    res
      .status(500)
      .json({ message: "Error interno del servidor al actualizar el rol." });
  }
});

// --- Ruta Principal y Manejadores de Error

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src/paginas/prueba.html")); // Ajusta a tu página de inicio
});

// Middleware para manejar rutas no encontradas (404)
// Debe ir después de todas tus rutas específicas
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "src/paginas/Error/404.html"));
});

// Middleware de manejo de errores global
// Debe ser el último middleware
app.use((err, req, res, next) => {
  console.error("Error global no manejado:", err.stack);
  // Evitar enviar el stack de error al cliente en producción por seguridad
  const statusCode = err.status || 500;
  const message =
    process.env.NODE_ENV === "production" && statusCode === 500
      ? "Algo salió mal en el servidor!"
      : err.message || "Error interno del servidor";
  res.status(statusCode).json({ message: message });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
