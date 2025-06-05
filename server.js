require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const pool = require("./src/config/db");
const isAdmin = require("./src/middleware/isAdmin");
const authController = require("./src/controllers/authController");
const adminController = require("./src/controllers/adminController");
const movieController = require("./src/controllers/movieController");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "src")));

app.use(
  session({
    store: new pgSession({
      pool: pool,
      tableName: "user_sessions",
    }),
    secret: "GOCINE123456",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// --- Endpoints Públicos ---
app.get("/api/movies", movieController.getMovies);
app.get("/api/upcoming", movieController.getUpcomingMovies);
app.get("/api/combos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM combos ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener los combos:", err.message);
    res.status(500).send("Error al obtener los combos");
  }
});

app.post("/api/register", authController.register);
app.post("/api/login", authController.login);
app.post("/api/logout", authController.logout);
app.post("/api/recuperar", authController.recuperar);
app.post("/api/restablecer-contrasena", authController.restablecerContrasena);
app.get("/api/session/status", authController.sessionStatus);

// --- Endpoints de Administración ---
app.get("/api/admin/movies", isAdmin, adminController.getMovies);
app.post("/api/admin/movies", isAdmin, adminController.addMovie);
app.put("/api/admin/movies/:id", isAdmin, adminController.updateMovie);
app.delete("/api/admin/movies/:id", isAdmin, adminController.deleteMovie);
app.get("/api/admin/movies/:id", isAdmin, adminController.getMovieById);

app.get("/api/admin/combos", isAdmin, adminController.getCombos);
app.post("/api/admin/combos", isAdmin, adminController.addCombo);
app.put("/api/admin/combos/:id", isAdmin, adminController.updateCombo);
app.delete("/api/admin/combos/:id", isAdmin, adminController.deleteCombo);
app.get("/api/admin/combos/:id", isAdmin, adminController.getComboById);

app.get("/api/admin/users", isAdmin, adminController.getUsers);
app.put("/api/admin/users/:userId/role", isAdmin, adminController.updateUserRole);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src/paginas/prueba.html"));
});

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "src/paginas/Error/404.html"));
});

app.use((err, req, res, next) => {
  console.error("Error global no manejado:", err.stack);
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
