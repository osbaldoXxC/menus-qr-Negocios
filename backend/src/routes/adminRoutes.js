const express = require('express');
const router = express.Router();
const { 
  getRestaurants, 
  approveRestaurant, 
  suspendRestaurant, 
  updateRestaurantStatus 
} = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Validar que el usuario sea SUPER_ADMIN para todas las rutas de este router
router.use(authMiddleware);
router.use(roleMiddleware(['SUPER_ADMIN']));

// GET /api/admin/restaurants
// Obtener todos los restaurantes registrados en el sistema
router.get('/restaurants', getRestaurants);

// PUT /api/admin/restaurants/:id/approve
// Aprobar restaurante y otorgar días de suscripción
router.put('/restaurants/:id/approve', approveRestaurant);

// PUT /api/admin/restaurants/:id/suspend
// Suspender restaurante (Kill Switch en lote + invalidación de tokens + caché)
router.put('/restaurants/:id/suspend', suspendRestaurant);

// PUT /api/admin/restaurants/:id/status
// Mantenido por compatibilidad histórica
router.put('/restaurants/:id/status', updateRestaurantStatus);

module.exports = router;
