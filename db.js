const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres", // Cambia esto si usaste otro usuario
    host: "localhost",
    database: "gocine", // Nombre de tu base de datos
    password: "Paolo_10", // Cambia esto por tu contraseña
    port: 5432, // Puerto predeterminado de PostgreSQL
});

module.exports = pool;