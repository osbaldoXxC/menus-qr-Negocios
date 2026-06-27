const redisClient = require('../config/redis');

const rateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 60 * 1000; // 1 minuto
  const max = options.max || 120; // Límite predeterminado: 120 solicitudes por minuto
  const message = options.message || 'Demasiadas solicitudes desde esta dirección IP. Por favor, intenta de nuevo más tarde.';

  return async (req, res, next) => {
    // Fail-safe: si Redis está desconectado, continuar la ejecución
    if (!redisClient.isOpen) {
      return next();
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    const key = `ratelimit:${ip}:${req.baseUrl || ''}${req.path}`;

    try {
      const current = await redisClient.incr(key);

      if (current === 1) {
        // Primera petición en la ventana temporal, definir expiración
        await redisClient.expire(key, Math.ceil(windowMs / 1000));
      }

      if (current > max) {
        return res.status(429).json({ mensaje: message });
      }

      next();
    } catch (error) {
      console.error('Error en rate limiter basado en Redis (fail-safe activo):', error);
      next();
    }
  };
};

module.exports = rateLimiter;
