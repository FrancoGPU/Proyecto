const express = require("express");
const path = require("path");
const pool = require("./db"); // Importa la conexión a PostgreSQL

const app = express();
const PORT = 3000;

// Middleware para procesar JSON en las solicitudes
app.use(express.json());

// Endpoint para obtener películas
app.get("/api/movies", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM movies");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error al obtener las películas");
  }
});

// Endpoint para obtener películas próximas
app.get("/api/upcoming", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM upcoming_movies");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error al obtener las películas");
  }
});

// Endpoint para obtener combos
app.get("/api/combos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM combos ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error al obtener los combos");
  }
});

// Endpoint para registrar usuarios
const bcrypt = require("bcrypt");

app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar si el correo ya está registrado
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar el nuevo usuario en la base de datos
    await pool.query("INSERT INTO users (email, password) VALUES ($1, $2)", [
      email,
      hashedPassword,
    ]);
    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (err) {
    console.error("Error al registrar el usuario:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Endpoint para iniciar sesión
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar si el usuario existe
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res
        .status(400)
        .json({ message: "Correo o contraseña incorrectos" });
    }

    // Comparar la contraseña ingresada con la almacenada
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res
        .status(400)
        .json({ message: "Correo o contraseña incorrectos" });
    }

    // Iniciar sesión exitosamente
    res.status(200).json({ message: "Inicio de sesión exitoso" });
  } catch (err) {
    console.error("Error al iniciar sesión:", err.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, "src")));

// Ruta principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src/paginas/prueba.html"));
});

// Iniciar el servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
