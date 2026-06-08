const db = require('../config/db');

const createCategory = async (req, res) => {
  const { nombre } = req.body;
  const restaurante_id = req.user.id;

  if (!nombre) {
    return res.status(400).json({ mensaje: 'El nombre de la categoría es obligatorio' });
  }

  try {
    const result = await db.query(
      'INSERT INTO categorias_catalogo (nombre, restaurante_id) VALUES ($1, $2) RETURNING id, nombre',
      [nombre, restaurante_id]
    );

    res.status(201).json({
      mensaje: 'Categoría creada correctamente',
      categoria: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

const getCategories = async (req, res) => {
  const restaurante_id = req.user.id;

  try {
    const result = await db.query(
      'SELECT id, nombre FROM categorias_catalogo WHERE restaurante_id = $1 ORDER BY nombre ASC',
      [restaurante_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

module.exports = {
  createCategory,
  getCategories
};
