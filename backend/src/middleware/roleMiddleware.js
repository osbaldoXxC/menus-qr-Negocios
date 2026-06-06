const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({ mensaje: 'Acceso prohibido: permisos insuficientes.' });
    }
    next();
  };
};

module.exports = roleMiddleware;
