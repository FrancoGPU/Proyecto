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
const purchaseController = require("./src/controllers/purchaseController");
const userController = require("./src/controllers/userController");

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
app.get("/api/movies/4d", movieController.get4DMovies);
app.get("/api/movies/premieres", movieController.getPremieres);
app.get("/api/movies/coming-soon", movieController.getComingSoon);
app.get("/api/movies/:id", movieController.getMovieDetails);
app.get("/api/theater-rooms", movieController.getTheaterRooms);
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
app.post("/api/notify-premiere", movieController.notifyPremiere);

// --- Endpoints de Perfil de Usuario ---
app.get("/api/user/profile", userController.getProfile);
app.put("/api/user/profile", userController.updateProfile);
app.get("/api/user/purchases", userController.getUserPurchases);
app.get("/api/user/ranks", userController.getRanks);
app.get("/api/user/points-history", userController.getPointsHistory);
app.post("/api/user/purchases/confirm", userController.confirmPurchase);
app.post("/api/user/invoice/generate", userController.generateInvoice);
app.get("/api/user/points", userController.getUserPoints);
app.get("/api/user/rank", userController.getUserRank);

// --- Endpoints Newsletter ---
app.post("/api/newsletter/subscribe", userController.subscribeNewsletter);

// --- Endpoints VIP ---
const User = require("./src/models/User");

// Verificar estado VIP del usuario actual en sesión
app.get("/api/user/vip-status", async (req, res) => {
  try {
    if (!req.session.user || !req.session.user.id) {
      return res.json({ isVip: false, discountPercentage: 0 });
    }

    const userId = req.session.user.id;
    const isVip = await User.isVipActive(userId);
    const discountPercentage = await User.getVipDiscount(userId);
    
    res.json({
      isVip,
      discountPercentage
    });
  } catch (error) {
    console.error("Error al verificar estado VIP:", error);
    res.json({ isVip: false, discountPercentage: 0 });
  }
});

// Verificar estado VIP de un usuario específico
app.get("/api/users/:userId/vip-status", async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Verificar si el usuario autenticado puede acceder a esta información
    if (!req.session.user || (req.session.user.id != userId && req.session.user.role !== 'admin')) {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    const isVip = await User.isVipActive(userId);
    const discountPercentage = await User.getVipDiscount(userId);
    
    res.json({
      isVip,
      discountPercentage
    });
  } catch (error) {
    console.error("Error al verificar estado VIP:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Actualizar usuario a VIP (solo administradores)
app.post("/api/admin/users/:userId/upgrade-vip", isAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;
    const { discountPercentage = 15, membershipDurationMonths = 12 } = req.body;
    
    const updatedUser = await User.upgradeToVip(userId, discountPercentage, membershipDurationMonths);
    
    res.json({
      message: "Usuario actualizado a VIP exitosamente",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        is_vip: updatedUser.is_vip,
        vip_discount_percentage: updatedUser.vip_discount_percentage
      }
    });
  } catch (error) {
    console.error("Error al actualizar usuario a VIP:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Remover estado VIP (solo administradores)
app.delete("/api/admin/users/:userId/remove-vip", isAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const updatedUser = await User.removeVipStatus(userId);
    
    res.json({
      message: "Estado VIP removido exitosamente",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        is_vip: updatedUser.is_vip,
        vip_discount_percentage: updatedUser.vip_discount_percentage
      }
    });
  } catch (error) {
    console.error("Error al remover estado VIP:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// --- Endpoints de Compras ---
// Registrar una nueva compra
app.post("/api/purchases", purchaseController.createPurchase);

// Obtener historial de compras del usuario actual
app.get("/api/purchases/history", purchaseController.getUserPurchases);

// Obtener estadísticas de compras (solo administradores)
app.get("/api/admin/purchases/stats", isAdmin, purchaseController.getPurchaseStats);

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

// --- Endpoints de Dulcería ---
app.get("/api/dulceria", adminController.getDulceria); // Ruta pública para productos individuales
app.get("/api/admin/dulceria", isAdmin, adminController.getDulceria);
app.post("/api/admin/dulceria", isAdmin, adminController.addDulceria);
app.put("/api/admin/dulceria/:id", isAdmin, adminController.updateDulceria);
app.delete("/api/admin/dulceria/:id", isAdmin, adminController.deleteDulceria);
app.get("/api/admin/dulceria/:id", isAdmin, adminController.getDulceriaById);

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
