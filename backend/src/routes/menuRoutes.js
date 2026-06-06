const express = require('express');
const router = express.Router();
const { createDish } = require('../controllers/menuController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// POST /api/menu/platillos
// Solo accesible por Restaurantes y Super Admins
router.post('/platillos', authMiddleware, roleMiddleware(['restaurante', 'super_admin']), createDish);

module.exports = router;
