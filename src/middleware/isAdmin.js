module.exports = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === "admin") {
    return next();
  } else if (req.session && req.session.user) {
    return res.status(403).json({
      message: "Acceso denegado. Se requieren privilegios de administrador.",
    });
  } else {
    return res.status(401).json({
      message: "No autenticado. Por favor, inicia sesión.",
    });
  }
};
