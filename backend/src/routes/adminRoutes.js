const express = require('express');
const router = express.Router();
const { updateRestaurantStatus } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// PUT /api/admin/restaurants/:id/status
// Solo accesible por Super Admins
router.put('/restaurants/:id/status', 
  authMiddleware, 
  roleMiddleware(['SUPER_ADMIN']), 
  updateRestaurantStatus
);

module.exports = router;
