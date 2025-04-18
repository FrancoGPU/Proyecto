const express = require("express");
const path = require("path");
const pool = require("./db"); // Importa la conexión a PostgreSQL

const app = express();
const PORT = 3000;

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, "src")));

// Ruta principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "src/paginas/prueba.html"));
});

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

app.get("/api/upcoming", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM upcoming_movies WHERE release_date > NOW()");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Error al obtener las películas próximas");
    }
});

app.get("/api/combos", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM combos");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Error al obtener los combos");
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});