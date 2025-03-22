const express = require('express');
const router = express.Router();
const { getSalesReport, getTopProducts, getDailySales, getCustomerRanking, getBalance } = require('../controllers/reportController');



const authMiddleware = require('../middleware/authMiddleware');



router.get('/sales', authMiddleware, getSalesReport);
router.get('/top-products', authMiddleware, getTopProducts);
router.get('/daily', authMiddleware, getDailySales);
router.get('/customers', authMiddleware, getCustomerRanking);
router.get('/balance', authMiddleware, getBalance);




module.exports = router;





