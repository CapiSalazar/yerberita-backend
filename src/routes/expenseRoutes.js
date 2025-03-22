const express = require('express');
const router = express.Router();
const { createExpense, getExpenseSummary,getAllExpenses } = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');

// Ruta para registrar un gasto
router.post('/', authMiddleware, createExpense);
// Ruta para obtener la suma de gastos
router.get('/summary', authMiddleware, getExpenseSummary); // 👈 nuevo endpoint
// Listado de todos los gastos
router.get('/', authMiddleware, getAllExpenses);


module.exports = router;