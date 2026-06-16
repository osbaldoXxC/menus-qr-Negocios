const express = require('express');
const router = express.Router();
const { findMatches, registerInteraction } = require('../controllers/searchController');

// POST /api/search/matches
// Búsqueda de platillos por sabor/antojo con filtros de alergias
router.post('/matches', findMatches);

// POST /api/search/interactions
// Registro de interacciones del usuario (like/dislike)
router.post('/interactions', registerInteraction);

module.exports = router;