const express = require('express');
const router = express.Router();

// ✅ Importa el middleware correctamente
const authMiddleware = require('../middleware/authMiddleware');

// ✅ Importa tus controladores
const {
  getAllOrders,
  createOrder,
  getOrderById,
  updateOrderStatus
} = require('../controllers/orderController');

// ✅ Coloca las rutas más específicas primero
router.put('/orders/:id/status', authMiddleware, updateOrderStatus);
router.get('/', authMiddleware, getAllOrders);
router.post('/', authMiddleware, createOrder);
router.get('/:id', authMiddleware, getOrderById); // Esta al final

module.exports = router;
