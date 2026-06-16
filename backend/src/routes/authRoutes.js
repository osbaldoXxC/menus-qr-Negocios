const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { register, login, refreshToken, updateProfile, changePassword } = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/refresh
router.post('/refresh', refreshToken);

// PUT /api/auth/perfil
router.put('/perfil', authMiddleware, updateProfile);

// PUT /api/auth/password
router.put('/password', authMiddleware, changePassword);

module.exports = router;
