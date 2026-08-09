const express = require('express');
const router = express.Router();
const { getPublicMenu, getPublicRecommendations } = require('../controllers/menuController');

// GET /api/public/menu/:restaurant_id
// Endpoint público para comensales que escanean el QR
router.get('/:restaurant_id', getPublicMenu);

// POST /api/public/menu/:restaurant_id/recommendations
// Endpoint público de recomendación de platillos impulsado por ML Python / Fallback
router.post('/:restaurant_id/recommendations', getPublicRecommendations);

module.exports = router;
