const express = require('express');
const router = express.Router();
const { generateQR } = require('../controllers/restaurantController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// GET /api/restaurants/qr
// Solo accesible por Restaurantes autenticados
router.get('/qr', authMiddleware, roleMiddleware(['RESTAURANTE', 'SUPER_ADMIN']), generateQR);

module.exports = router;
