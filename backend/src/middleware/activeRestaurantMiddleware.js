const db = require('../config/db');

const activeRestaurantMiddleware = async (req, res, next) => {
  try {
    // 1. Omitir verificación si es SUPER_ADMIN
    if (req.user && req.user.rol === 'SUPER_ADMIN') {
      return next();
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ mensaje: 'No autorizado. Token no válido.' });
    }

    // 2. Consultar la base de datos
    const result = await db.query(
      'SELECT estado, suscripcion_activa FROM restaurantes WHERE id = $1 LIMIT 1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Restaurante no encontrado.' });
    }

    const { estado, suscripcion_activa } = result.rows[0];

    // Bloquear explícitamente si está suspendido
    if (estado === 'suspendido') {
      return res.status(403).json({ mensaje: 'Acceso denegado: Cuenta suspendida.' });
    }

    // Si la cuenta está aprobada pero la suscripción ya no está activa, bloquear
    if (estado === 'aprobado' && !suscripcion_activa) {
      return res.status(403).json({ mensaje: 'Acceso denegado: Suscripción inactiva o vencida.' });
    }

    next();
  } catch (error) {
    console.error('Error en activeRestaurantMiddleware:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
  }
};

module.exports = activeRestaurantMiddleware;
