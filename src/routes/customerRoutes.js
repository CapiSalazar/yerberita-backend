const express = require('express');
const router = express.Router();
const { createCustomer, getCustomers, updateCustomer,getCustomerById } = require('../controllers/customerController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createCustomer);
router.get('/', authMiddleware, getCustomers);
router.put('/:id', authMiddleware, updateCustomer);
router.get('/:id', authMiddleware, getCustomerById); // 🆕



module.exports = router;