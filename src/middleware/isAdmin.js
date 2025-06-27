module.exports = (req, res, next) => {
  // Verificar admin usando is_admin o role (para compatibilidad con usuarios existentes)
  const isAdmin = req.session && req.session.user && 
                 (req.session.user.is_admin || req.session.user.role === 'admin');

  if (isAdmin) {
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
