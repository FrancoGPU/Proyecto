const bcrypt = require("bcrypt");
const pool = require("../config/db");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "1gocine12@gmail.com",
    pass: "dwcc haia lsur xqor",
  },
});

module.exports = {
  register: async (req, res) => {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
      return res.status(400).json({
        message: "Nombre de usuario, correo y contraseña son requeridos.",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        message: "La contraseña debe tener al menos 6 caracteres.",
      });
    }
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await pool.query(
        "INSERT INTO users (email, password, username, role) VALUES ($1, $2, $3, $4) RETURNING id, email, username, role",
        [email, hashedPassword, username, "usuario"]
      );
      res.status(201).json({ message: "Usuario registrado exitosamente." });
    } catch (err) {
      console.error("Error al registrar el usuario:", err.message);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña son requeridos." });
    }
    try {
      const result = await pool.query(
        "SELECT id, username, email, password, role FROM users WHERE email = $1",
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
        username: user.username,
        role: user.role,
      };
      res.json({
        message: "Inicio de sesión exitoso.",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      });
    } catch (err) {
      console.error("Error en el inicio de sesión:", err.message);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  },
  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error al cerrar sesión:", err);
        return res.status(500).json({ message: "No se pudo cerrar la sesión." });
      }
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Cierre de sesión exitoso." });
    });
  },
  recuperar: async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Correo electrónico es requerido." });
    }
    try {
      const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (userResult.rows.length === 0) {
        return res.json({
          message: "Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.",
        });
      }

      const user = userResult.rows[0];
      const recoveryToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 3600000);

      await pool.query(
        "UPDATE users SET recovery_token = $1, recovery_token_expires_at = $2 WHERE id = $3",
        [recoveryToken, expiresAt, user.id]
      );

      const recoveryLink = `http://localhost:3000/paginas/restablecer-contrasena.html?token=${recoveryToken}`;

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
          return res.status(500).json({ message: "Error al procesar la solicitud. Inténtalo de nuevo más tarde." });
        }
        res.json({
          message: "Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.",
        });
      });
    } catch (err) {
      console.error("Error en /api/recuperar:", err.message);
      res.status(500).json({ message: "Error interno del servidor." });
    }
  },
  restablecerContrasena: async (req, res) => {
    const { token, nuevaPassword } = req.body;
    if (!token || !nuevaPassword) {
      return res.status(400).json({ message: "Token y nueva contraseña son requeridos." });
    }
    if (nuevaPassword.length < 6) {
      return res.status(400).json({ message: "La nueva contraseña debe tener al menos 6 caracteres." });
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
  },
  sessionStatus: (req, res) => {
    if (req.session.user) {
      return res.status(200).json({
        loggedIn: true,
        user: req.session.user,
      });
    }
    res.status(200).json({ loggedIn: false });
  },
};
