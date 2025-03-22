const pool = require('../config/db');

const createCustomer = async (req, res) => {
  const { name, email, telefono } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Nombre y correo son obligatorios' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO customers (name, email, telefono) VALUES ($1, $2, $3) RETURNING *',
      [name, email, telefono || null] // permite que "telefono" sea opcional
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

module.exports = {
  createCustomer,
  getCustomers
};
