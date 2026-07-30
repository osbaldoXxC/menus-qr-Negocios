const db = require('../config/db');

const getConversationsAdmin = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, r.nombre_negocio, r.plan,
             (SELECT count(*) FROM soporte_mensajes m WHERE m.conversacion_id = c.id AND m.remitente_tipo = 'RESTAURANTE' AND m.leido = false) as unread_count
      FROM soporte_conversaciones c
      JOIN restaurantes r ON c.restaurante_id = r.id
      ORDER BY c.updated_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error in getConversationsAdmin:', error);
    res.status(500).json({ mensaje: 'Error interno' });
  }
};

const getConversationRestaurante = async (req, res) => {
  const restaurante_id = req.user.id;
  try {
    const result = await db.query(`
      SELECT * FROM soporte_conversaciones 
      WHERE restaurante_id = $1 
      ORDER BY created_at DESC LIMIT 1
    `, [restaurante_id]);

    if (result.rows.length === 0) {
      return res.json(null);
    }

    const conversacion = result.rows[0];
    
    const mensajesRes = await db.query(`
      SELECT * FROM soporte_mensajes 
      WHERE conversacion_id = $1 
      ORDER BY created_at ASC
    `, [conversacion.id]);

    // Marcar como leidos
    await db.query(`
      UPDATE soporte_mensajes SET leido = true 
      WHERE conversacion_id = $1 AND remitente_tipo = 'ADMIN' AND leido = false
    `, [conversacion.id]);

    res.json({
      ...conversacion,
      mensajes: mensajesRes.rows
    });
  } catch (error) {
    console.error('Error in getConversationRestaurante:', error);
    res.status(500).json({ mensaje: 'Error interno' });
  }
};

const sendMessageRestaurante = async (req, res) => {
  const restaurante_id = req.user.id;
  const { mensaje } = req.body;

  if (!mensaje || !mensaje.trim()) {
    return res.status(400).json({ mensaje: 'Mensaje vacío' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    let conversacionRes = await client.query(`
      SELECT * FROM soporte_conversaciones 
      WHERE restaurante_id = $1 AND estado != 'cerrada'
      ORDER BY created_at DESC LIMIT 1
    `, [restaurante_id]);

    let conversacion_id;

    if (conversacionRes.rows.length === 0) {
      const nuevaConv = await client.query(`
        INSERT INTO soporte_conversaciones (restaurante_id) 
        VALUES ($1) RETURNING id
      `, [restaurante_id]);
      conversacion_id = nuevaConv.rows[0].id;
    } else {
      conversacion_id = conversacionRes.rows[0].id;
      // Actualizar timestamp
      await client.query(`UPDATE soporte_conversaciones SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [conversacion_id]);
    }

    const nuevoMensaje = await client.query(`
      INSERT INTO soporte_mensajes (conversacion_id, remitente_tipo, mensaje) 
      VALUES ($1, 'RESTAURANTE', $2) RETURNING *
    `, [conversacion_id, mensaje]);

    await client.query('COMMIT');
    res.json(nuevoMensaje.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in sendMessageRestaurante:', error);
    res.status(500).json({ mensaje: 'Error interno' });
  } finally {
    client.release();
  }
};

const getConversationMessagesAdmin = async (req, res) => {
  const { conversacion_id } = req.params;
  try {
    const mensajesRes = await db.query(`
      SELECT * FROM soporte_mensajes 
      WHERE conversacion_id = $1 
      ORDER BY created_at ASC
    `, [conversacion_id]);

    // Marcar como leidos
    await db.query(`
      UPDATE soporte_mensajes SET leido = true 
      WHERE conversacion_id = $1 AND remitente_tipo = 'RESTAURANTE' AND leido = false
    `, [conversacion_id]);

    res.json(mensajesRes.rows);
  } catch (error) {
    console.error('Error in getConversationMessagesAdmin:', error);
    res.status(500).json({ mensaje: 'Error interno' });
  }
};

const sendMessageAdmin = async (req, res) => {
  const admin_id = req.user.id;
  const { conversacion_id } = req.params;
  const { mensaje } = req.body;

  if (!mensaje || !mensaje.trim()) {
    return res.status(400).json({ mensaje: 'Mensaje vacío' });
  }

  try {
    const nuevoMensaje = await db.query(`
      INSERT INTO soporte_mensajes (conversacion_id, remitente_tipo, remitente_id, mensaje) 
      VALUES ($1, 'ADMIN', $2, $3) RETURNING *
    `, [conversacion_id, admin_id, mensaje]);

    await db.query(`UPDATE soporte_conversaciones SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [conversacion_id]);

    res.json(nuevoMensaje.rows[0]);
  } catch (error) {
    console.error('Error in sendMessageAdmin:', error);
    res.status(500).json({ mensaje: 'Error interno' });
  }
};

const resolveConversation = async (req, res) => {
  const { conversacion_id } = req.params;
  const { estado } = req.body; // 'resuelta', 'cerrada', 'abierta'

  try {
    await db.query(`
      UPDATE soporte_conversaciones 
      SET estado = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `, [estado || 'resuelta', conversacion_id]);
    res.json({ mensaje: 'Estado actualizado' });
  } catch (error) {
    console.error('Error in resolveConversation:', error);
    res.status(500).json({ mensaje: 'Error interno' });
  }
};

module.exports = {
  getConversationsAdmin,
  getConversationRestaurante,
  sendMessageRestaurante,
  getConversationMessagesAdmin,
  sendMessageAdmin,
  resolveConversation
};
