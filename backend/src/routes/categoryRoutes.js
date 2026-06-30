const express = require('express');
const router = express.Router();
const { 
  createCategory, 
  getCategories, 
  updateCategory, 
  deleteCategory, 
  reorderCategories,
  getCocinas,
  getPorciones
} = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const activeRestaurantMiddleware = require('../middleware/activeRestaurantMiddleware');

// Prefijo: /api/categories
// Todos requieren autenticación y rol de Restaurante o Admin

router.use(authMiddleware);
router.use(roleMiddleware(['RESTAURANTE', 'SUPER_ADMIN']));

router.get('/cocinas', getCocinas);
router.get('/porciones', getPorciones);

router.get('/', getCategories);
router.post('/', activeRestaurantMiddleware, createCategory);
router.put('/orden', activeRestaurantMiddleware, reorderCategories);
router.put('/:id', activeRestaurantMiddleware, updateCategory);
router.delete('/:id', activeRestaurantMiddleware, deleteCategory);

module.exports = router;
