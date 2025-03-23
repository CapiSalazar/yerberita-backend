const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getAllOrders,
  createOrder,
  getOrderById
} = require('../controllers/orderController');

const router = express.Router();

// ✅ Colocar rutas específicas primero
router.get('/', authMiddleware, getAllOrders); // Lista todas las órdenes
router.post('/', authMiddleware, createOrder);
router.get('/:id', authMiddleware, getOrderById); // Esta debe ir al final
router.put('/orders/:id/status', verifyToken, updateOrderStatus);


module.exports = router;
