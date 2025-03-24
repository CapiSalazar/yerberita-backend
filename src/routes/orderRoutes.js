const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const {
  getAllOrders,
  createOrder,
  getOrderById,
  markOrderAsDelivered,
  markOrderAsPaid
} = require('../controllers/orderController');

// Rutas específicas primero
router.patch('/entregar/:id', authMiddleware, markOrderAsDelivered);
router.patch('/pagar/:id', authMiddleware, markOrderAsPaid);

router.get('/', authMiddleware, getAllOrders);
router.post('/', authMiddleware, createOrder);
router.get('/:id', authMiddleware, getOrderById);

module.exports = router;
