const db = require('../config/db');
const axios = require('axios');

const findMatches = async (req, res) => {
  const { sabor_antojo, alergias_ids } = req.body;

  if (!sabor_antojo) {
    return res.status(400).json({ mensaje: 'El campo sabor_antojo es obligatorio' });
  }

  try {
    // 1. Filtro Duro SQL: IDs de platillos de restaurantes activos y que NO contengan los alérgenos
    let query = `
      SELECT p.id 
      FROM platillos p 
      JOIN restaurantes r ON p.restaurante_id = r.id 
      WHERE r.suscripcion_activa = true
    `;

    const params = [];
    let paramIndex = 1;

    if (alergias_ids && Array.isArray(alergias_ids) && alergias_ids.length > 0) {
      query += ` AND p.id NOT IN (
        SELECT platillo_id FROM receta_platillo WHERE ingrediente_id = ANY($${paramIndex})
      )`;
      params.push(alergias_ids);
      paramIndex++;
    }

    const hardFilterRes = await db.query(query, params);
    const idsPermitidos = hardFilterRes.rows.map(row => row.id);

    if (idsPermitidos.length === 0) {
      return res.json({ resultados: [] });
    }

    // 2. Llamar al AI Engine para el Filtro Vectorial (DESHABILITADO TEMPORALMENTE - ÉPICA 7)
    /*
    const aiResponse = await axios.post(`${process.env.AI_ENGINE_URL || 'http://ai-engine:8000'}/matches`, {
      sabor_antojo,
      ids_permitidos: idsPermitidos
    });

    const aiMatches = aiResponse.data.resultados;

    if (!aiMatches || aiMatches.length === 0) {
      return res.json({ resultados: [] });
    }
    */

    // FALLBACK SIN IA: Búsqueda básica por texto en nombre o descripción
    const searchParam = `%${sabor_antojo}%`;
    const fallbackRes = await db.query(
      `SELECT p.id, p.nombre, p.precio, p.url_imagen, p.descripcion, r.nombre_negocio 
       FROM platillos p
       JOIN restaurantes r ON p.restaurante_id = r.id
       WHERE p.id = ANY($1) AND (p.nombre ILIKE $2 OR p.descripcion ILIKE $2)
       LIMIT 15`,
      [idsPermitidos, searchParam]
    );

    const resultados = fallbackRes.rows.map(row => ({
      ...row,
      match_score: 1.0, // Falso score para mantener formato
      porcentaje_match: 100
    }));

    res.json({ resultados });

  } catch (error) {
    console.error('Error en búsqueda de matches:', error.message);
    res.status(500).json({ mensaje: 'Error interno al procesar la búsqueda' });
  }
};

module.exports = {
  findMatches
};
