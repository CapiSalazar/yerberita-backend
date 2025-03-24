const pool = require('../config/db');

// ✅ Obtener todas las órdenes con costo de producción
console.log("🛠 Ejecutando getAllOrders...");

const getAllOrders = async (req, res) => {
  console.log("🛠 Ejecutando getAllOrders...");
  try {
    const result = await pool.query(`
      SELECT 
        o.id,
        o.total_price,
        o.created_at,
        c.name AS customer,
        COALESCE(SUM(p.costo_produccion * op.quantity), 0) AS total_costo_produccion
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      JOIN order_products op ON o.id = op.order_id
      JOIN products p ON op.product_id = p.id
      GROUP BY o.id, c.name, o.created_at
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
          products: productsResult.rows
        };
      })
    );

    console.log("📦 Órdenes con costos:", orders); // 💥 este log es clave
    res.json(orders);
  } catch (error) {
    console.error("🔥 Error al obtener órdenes:", error);
    res.status(500).json({ error: "Error al obtener órdenes" });
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

    console.log(`📦 Orden #${orderId} creada. Detalle de productos:`, orderProducts);

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

// Modificar los status de una orden

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { is_delivered, is_paid } = req.body;

  try {
    // 1. Obtenemos el estado actual de la orden
    const current = await pool.query('SELECT is_delivered, is_paid FROM orders WHERE id = $1', [id]);

    if (current.rowCount === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    const order = current.rows[0];
    const updates = [];
    const values = [];
    let index = 1;

    // ✅ Solo permitimos cambiar de false a true
    if (is_delivered === true && order.is_delivered === false) {
      updates.push(`is_delivered = $${index}`);
      values.push(true);
      index++;

      updates.push(`delivered_at = $${index}`);
      values.push(new Date());
      index++;
    }

    if (is_paid === true && order.is_paid === false) {
      updates.push(`is_paid = $${index}`);
      values.push(true);
      index++;

      updates.push(`paid_at = $${index}`);
      values.push(new Date());
      index++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No hay cambios válidos. La orden ya estaba entregada o pagada.' });
    }

    values.push(id);
    const query = `UPDATE orders SET ${updates.join(', ')} WHERE id = $${index} RETURNING *`;

    const result = await pool.query(query, values);

    res.json({ message: 'Estado actualizado ✅', order: result.rows[0] });
  } catch (error) {
    console.error('🔥 Error al actualizar estado de orden:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ✅ Marcar orden como entregada
const markOrderAsDelivered = async (req, res) => {
  const { id } = req.params;
  console.log("📦 PATCH /entregar/:id body:", req.body);

  try {
    const current = await pool.query('SELECT is_delivered FROM orders WHERE id = $1', [id]);

    if (current.rowCount === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    const order = current.rows[0]; // ✅ Asignación que faltaba
    console.log('🎯 Estado actual de orden:', order);

    if (order.is_delivered) {
      return res.status(400).json({ error: 'La orden ya fue entregada.' });
    }

    const result = await pool.query(`
      UPDATE orders 
      SET is_delivered = true, delivered_at = NOW() 
      WHERE id = $1 
      RETURNING *
    `, [id]);

    res.json({ message: 'Orden marcada como entregada ✅', order: result.rows[0] });
  } catch (error) {
    console.error('🔥 Error en markOrderAsDelivered:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


// ✅ Marcar orden como pagada
const markOrderAsPaid = async (req, res) => {
  const { id } = req.params;
  console.log("💳 PATCH /pagar/:id body:", req.body);

  try {
    const current = await pool.query('SELECT is_paid FROM orders WHERE id = $1', [id]);

    if (current.rowCount === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    const order = current.rows[0];
    console.log('🎯 Estado actual de orden:', order);

    if (order.is_paid) {
      return res.status(400).json({ error: 'La orden ya fue pagada.' });
    }

    const result = await pool.query(`
      UPDATE orders 
      SET is_paid = true, paid_at = NOW() 
      WHERE id = $1 
      RETURNING *
    `, [id]);

    res.json({ message: 'Orden marcada como pagada ✅', order: result.rows[0] });
  } catch (error) {
    console.error('🔥 Error en markOrderAsPaid:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};



module.exports = {
    createOrder,
    getOrderById,
    getAllOrders, // <-- que esté aquí 
    updateOrderStatus,
    markOrderAsDelivered,
    markOrderAsPaid
  };
  

 
