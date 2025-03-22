const pool = require('../config/db');

// ✅ Obtener todas las órdenes con sus productos
const getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.id, o.total_price, o.created_at, c.name AS customer
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC
    `);

    const orders = await Promise.all(
      result.rows.map(async (order) => {
        const productsResult = await pool.query(`
          SELECT p.name, op.quantity
          FROM order_products op
          JOIN products p ON op.product_id = p.id
          WHERE op.order_id = $1
        `, [order.id]);

        return {
          order,
          products: productsResult.rows,
        };
      })
    );

    res.json(orders);
  } catch (error) {
    console.error('🔥 Error al obtener órdenes:', error);
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
};

// ✅ Crear una nueva orden
const createOrder = async (req, res) => {
  try {
    console.log("📩 Request body recibido:", req.body);

    const { customer_id, products } = req.body;

    if (!customer_id || !products || products.length === 0) {
      return res.status(400).json({ error: "Cliente y productos son obligatorios" });
    }

    let total = 0;
    const orderProducts = [];

    for (const item of products) {
      const productResult = await pool.query(
        "SELECT price FROM products WHERE id = $1 AND status = 'activo'",
        [item.product_id]
      );

      if (productResult.rows.length === 0) {
        return res.status(400).json({ error: `Producto con ID ${item.product_id} no disponible` });
      }

      const price = parseFloat(productResult.rows[0].price);
      const subtotal = price * item.quantity;
      total += subtotal;

      orderProducts.push({
        product_id: item.product_id,
        quantity: item.quantity,
        subtotal
      });
    }

    const orderResult = await pool.query(
      "INSERT INTO orders (customer_id, total_price) VALUES ($1, $2) RETURNING id",
      [customer_id, total]
    );

    const orderId = orderResult.rows[0].id;

    for (const item of orderProducts) {
      await pool.query(
        "INSERT INTO order_products (order_id, product_id, quantity, subtotal) VALUES ($1, $2, $3, $4)",
        [orderId, item.product_id, item.quantity, item.subtotal]
      );
    }

    res.status(201).json({ message: "Orden creada con éxito", order_id: orderId, total });
  } catch (error) {
    console.error("🔥 Error en createOrder:", error);
    res.status(500).json({ error: "Error al crear orden" });
  }
};

// ✅ Obtener una orden específica con sus productos
const getOrderById = async (req, res) => {
  const { id } = req.params;

  try {
    const orderResult = await pool.query(`
      SELECT o.id, o.total_price, o.created_at, c.name AS customer
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.id = $1
    `, [id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    const order = orderResult.rows[0];

    const productsResult = await pool.query(`
      SELECT p.name, op.quantity, op.subtotal
      FROM order_products op
      JOIN products p ON op.product_id = p.id
      WHERE op.order_id = $1
    `, [id]);

    res.json({
      order,
      products: productsResult.rows
    });
  } catch (error) {
    console.error("🔥 Error al obtener la orden:", error);
    res.status(500).json({ error: "Error al obtener la orden" });
  }
};

module.exports = {
    createOrder,
    getOrderById,
    getAllOrders // <-- que esté aquí
  };
  

 
