const express = require('express');
const router = express.Router();
const { getPublicMenu } = require('../controllers/menuController');

// GET /api/menu/:restaurant_id
// Endpoint público para comensales que escanean el QR
router.get('/:restaurant_id', getPublicMenu);

module.exports = router;
