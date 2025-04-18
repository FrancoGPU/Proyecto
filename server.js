const express = require("express");
const path = require("path");
const pool = require("./db"); // Importa la conexión a PostgreSQL

const app = express();
const PORT = 3000;

// Ruta principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "src/paginas/prueba.html"));
});

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, "src")));

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

// Iniciar el servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});