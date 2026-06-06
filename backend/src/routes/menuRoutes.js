const express = require('express');
const router = express.Router();
const { createDish } = require('../controllers/menuController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// POST /api/menu/platillos
// Solo accesible por Restaurantes y Super Admins
// Permite subir una imagen bajo el campo 'imagen'
router.post('/platillos', authMiddleware, roleMiddleware(['restaurante', 'super_admin']), upload.single('imagen'), createDish);

module.exports = router;
