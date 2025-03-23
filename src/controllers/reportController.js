const pool = require('../config/db');

// ✅ Reporte por rango de fechas
const getSalesReport = async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: "Debes proporcionar parámetros 'from' y 'to'" });
  }

  try {
    const result = await pool.query(
      `
      SELECT COUNT(*) AS total_orders, SUM(total_price) AS total_revenue
      FROM orders
      WHERE created_at BETWEEN $1 AND $2
      `,
      [from, to]
    );

    res.json({
      total_orders: parseInt(result.rows[0].total_orders, 10),
      total_revenue: parseFloat(result.rows[0].total_revenue || 0),
      from,
      to
    });
  } catch (error) {
    console.error("🔥 Error al generar reporte de ventas:", error);
    res.status(500).json({ error: "Error al generar reporte de ventas" });
  }
};

// ✅ Top 10 productos más vendidos
const getTopProducts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.name,
        SUM(op.quantity) AS total_quantity,
        SUM(op.subtotal) AS total_revenue
      FROM order_products op
      JOIN products p ON op.product_id = p.id
      GROUP BY p.name
      ORDER BY total_quantity DESC
      LIMIT 10
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("🔥 Error al obtener productos más vendidos:", error);
    res.status(500).json({ error: "Error al obtener productos más vendidos" });
  }
};

// ✅ Ventas diarias
const getDailySales = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        DATE(created_at) AS date,
        COUNT(*) AS total_orders,
        SUM(total_price) AS total_revenue
      FROM orders
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("🔥 Error al obtener ventas diarias:", error);
    res.status(500).json({ error: "Error al obtener ventas diarias" });
  }
};

// ✅ Ranking de clientes
const getCustomerRanking = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.name AS customer,
        COUNT(o.id) AS total_orders,
        SUM(o.total_price) AS total_spent
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      GROUP BY c.name
      ORDER BY total_spent DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("🔥 Error al generar ranking de clientes:", error);
    res.status(500).json({ error: "Error al generar ranking de clientes" });
  }
};

// ✅ Balance completo
const getBalance = async (req, res) => {
    try {
      const incomeResult = await pool.query(`
        SELECT COALESCE(SUM(p.price * op.quantity), 0) AS total_income
        FROM order_products op
        JOIN products p ON op.product_id = p.id
        JOIN orders o ON op.order_id = o.id
        WHERE o.status = 'activo'
      `);
      const total_income = parseFloat(incomeResult.rows[0].total_income);
  
      const expenseResult = await pool.query(`
        SELECT COALESCE(SUM(amount), 0) AS total_expenses
        FROM expenses
      `);
      const total_expenses = parseFloat(expenseResult.rows[0].total_expenses);
  
      const costResult = await pool.query(`
        SELECT COALESCE(SUM(p.costo_produccion * op.quantity), 0) AS total_production_cost
        FROM order_products op
        JOIN products p ON op.product_id = p.id
        JOIN orders o ON op.order_id = o.id
        WHERE o.status = 'activo'
      `);
      const total_production_cost = parseFloat(costResult.rows[0].total_production_cost);
  
      const balance = total_income - total_expenses;
      const net_profit = balance - total_production_cost;
  
      res.json({
        total_income,
        total_expenses,
        balance,
        total_production_cost,
        net_profit,
        status: balance >= 0 ? 'ganancia' : 'pérdida'
      });
    } catch (error) {
      console.error("🔥 Error al calcular balance:", error);
      res.status(500).json({ error: "Error al calcular punto de equilibrio" });
    }
  };
  

// ✅ Exportar todos los controladores
module.exports = {
  getSalesReport,
  getTopProducts,
  getDailySales,
  getCustomerRanking,
  getBalance
};
