const express = require('express');
const router = express.Router();
const { 
  getConversationsAdmin, 
  getConversationRestaurante, 
  sendMessageRestaurante, 
  getConversationMessagesAdmin, 
  sendMessageAdmin, 
  resolveConversation 
} = require('../controllers/supportController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { requireFeature, subscriptionMiddleware } = require('../middleware/subscriptionMiddleware');

// Rutas de Restaurante
router.get('/my-conversation', authMiddleware, roleMiddleware(['RESTAURANTE']), subscriptionMiddleware, requireFeature('soporte_premium'), getConversationRestaurante);
router.post('/my-conversation/messages', authMiddleware, roleMiddleware(['RESTAURANTE']), subscriptionMiddleware, requireFeature('soporte_premium'), sendMessageRestaurante);

// Rutas de Admin
router.get('/admin/conversations', authMiddleware, roleMiddleware(['SUPER_ADMIN']), getConversationsAdmin);
router.get('/admin/conversations/:conversacion_id/messages', authMiddleware, roleMiddleware(['SUPER_ADMIN']), getConversationMessagesAdmin);
router.post('/admin/conversations/:conversacion_id/messages', authMiddleware, roleMiddleware(['SUPER_ADMIN']), sendMessageAdmin);
router.put('/admin/conversations/:conversacion_id/status', authMiddleware, roleMiddleware(['SUPER_ADMIN']), resolveConversation);

module.exports = router;
