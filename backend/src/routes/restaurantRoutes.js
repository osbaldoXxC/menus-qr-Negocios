const express = require('express');
const router = express.Router();
const { generateQR, updateTheme, getRestaurantInfo } = require('../controllers/restaurantController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// GET /api/restaurants/info
router.get('/info', authMiddleware, roleMiddleware(['RESTAURANTE', 'SUPER_ADMIN']), getRestaurantInfo);

// GET /api/restaurants/qr
// Solo accesible por Restaurantes autenticados
router.get('/qr', authMiddleware, roleMiddleware(['RESTAURANTE', 'SUPER_ADMIN']), generateQR);

// PUT /api/restaurants/theme
// Solo accesible por Restaurantes autenticados (Premium)
router.put('/theme', authMiddleware, roleMiddleware(['RESTAURANTE', 'SUPER_ADMIN']), updateTheme);

module.exports = router;
