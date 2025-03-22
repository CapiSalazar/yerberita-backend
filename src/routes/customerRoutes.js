const express = require('express');
const router = express.Router();
const { createCustomer, getCustomers } = require('../controllers/customerController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createCustomer);
router.get('/', authMiddleware, getCustomers);

module.exports = router;
