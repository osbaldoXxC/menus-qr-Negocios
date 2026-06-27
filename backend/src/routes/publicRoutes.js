const express = require('express');
const router = express.Router();
const { getPublicMenu } = require('../controllers/menuController');
const rateLimiter = require('../middleware/rateLimiterMiddleware');

// GET /api/public/menu/:restaurant_id
// Endpoint público para comensales que escanean el QR. Limita a 100 llamadas por minuto por IP.
router.get('/:restaurant_id', rateLimiter({ max: 100 }), getPublicMenu);

module.exports = router;
