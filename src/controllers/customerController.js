const pool = require('../config/db');

const createCustomer = async (req, res) => {
  const { name, email, telefono, tipo_cliente, red_social } = req.body;

  // Validaciones básicas
  if (!name || !email) {
    return res.status(400).json({ error: 'Nombre y correo son obligatorios' });
  }

  // Validación de tipo_cliente
  const validTypes = ['B2B', 'B2C'];
  if (tipo_cliente && !validTypes.includes(tipo_cliente)) {
    return res.status(400).json({ error: 'tipo_cliente debe ser B2B o B2C' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO customers (name, email, telefono, tipo_cliente, red_social)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, email, telefono || null, tipo_cliente || null, red_social || null]
    );
    

    res.status(201).json({ customer: result.rows[0] });
  } catch (error) {
    console.error('🔥 Error al crear cliente:', error);
    res.status(500).json({ error: 'Error al crear cliente' });
  }
};

const getCustomers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers');
    res.json({ customers: result.rows });
  } catch (error) {
    console.error('🔥 Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
};

const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { name, email, telefono, tipo_cliente, red_social } = req.body;

  // Validar campos obligatorios
  if (!name || !email) {
    return res.status(400).json({ error: 'Nombre y correo son obligatorios' });
  }

  // Validar tipo_cliente
  const validTypes = ['B2B', 'B2C'];
  if (tipo_cliente && !validTypes.includes(tipo_cliente)) {
    return res.status(400).json({ error: 'tipo_cliente debe ser B2B o B2C' });
  }

  try {
    const result = await pool.query(
      `UPDATE customers 
       SET name = $1, email = $2, telefono = $3, tipo_cliente = $4, red_social = $5
       WHERE id = $6
       RETURNING *`,
      [name, email, telefono || null, tipo_cliente || null, red_social || null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json({ customer: result.rows[0] });
  } catch (error) {
    console.error('🔥 Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
};

const getCustomerById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json({ customer: result.rows[0] });
  } catch (error) {
    console.error('🔥 Error al obtener cliente por ID:', error);
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
};


module.exports = {
  createCustomer,
  getCustomers,
  updateCustomer,
  getCustomerById
};
