const pool = require('../config/db');

// Crear nuevo gasto
const createExpense = async (req, res) => {
    const { concept, amount, type } = req.body;

    if (!concept || !amount || !type) {
        return res.status(400).json({ error: "Faltan campos: concept, amount o type" });
    }

    try {
        const result = await pool.query(
            `INSERT INTO expenses (concept, amount, type)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [concept, amount, type]
        );

        res.status(201).json({ expense: result.rows[0] });
    } catch (error) {
        console.error("🔥 Error al crear gasto:", error);
        res.status(500).json({ error: "Error al registrar gasto" });
    }
};

// Obtener resumen de gastos
const getExpenseSummary = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                SUM(CASE WHEN type = 'fijo' THEN amount ELSE 0 END) AS total_fixed,
                SUM(CASE WHEN type = 'variable' THEN amount ELSE 0 END) AS total_variable,
                SUM(amount) AS total_expenses
            FROM expenses
        `);

        res.json(result.rows[0]);
    } catch (error) {
        console.error("🔥 Error al obtener resumen de gastos:", error);
        res.status(500).json({ error: "Error al obtener resumen de gastos" });
    }
};


// Obtener todos los gastos
const getAllExpenses = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, concept, amount, type, created_at
      FROM expenses
      ORDER BY created_at DESC
    `);

    res.json({ expenses: result.rows });
  } catch (error) {
    console.error("🔥 Error al obtener gastos:", error);
    res.status(500).json({ error: "Error al obtener gastos" });
  }
};

// Exportación
module.exports = {
    createExpense,
    getExpenseSummary,
    getAllExpenses
};

