const express = require('express');
const router = express.Router();
const { createCategory, getCategories } = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Prefijo: /api/categories
router.post('/', authMiddleware, roleMiddleware(['RESTAURANTE', 'SUPER_ADMIN']), createCategory);
router.get('/', authMiddleware, roleMiddleware(['RESTAURANTE', 'SUPER_ADMIN']), getCategories);

module.exports = router;
