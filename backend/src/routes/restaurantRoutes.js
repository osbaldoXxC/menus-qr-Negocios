const express = require('express');
const router = express.Router();
const { generateQR, updateTheme, getInfo } = require('../controllers/restaurantController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// GET /api/restaurants/qr
// Solo accesible por Restaurantes autenticados
router.get('/qr', authMiddleware, roleMiddleware(['RESTAURANTE', 'SUPER_ADMIN']), generateQR);

// GET /api/restaurants/info
// Info del restaurante autenticado
router.get('/info', authMiddleware, roleMiddleware(['RESTAURANTE', 'SUPER_ADMIN']), getInfo);

// PUT /api/restaurants/theme
// Solo accesible por Restaurantes autenticados (Premium)
router.put('/theme', authMiddleware, roleMiddleware(['RESTAURANTE', 'SUPER_ADMIN']), updateTheme);

module.exports = router;
