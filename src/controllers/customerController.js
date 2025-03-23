const pool = require('../config/db');

// 🔧 Normaliza strings eliminando acentos y bajando a minúsculas
const normalize = (str) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const GIROS_PERMITIDOS = [
  "Cafetería",
  "Restaurante",
  "Tienda Natural",
  "Herbolaria",
  "Veterinaria",
  "Corporativo",
  "Gimnasio",
  "Spa",
  "Distribuidora",
  "Otro"
];

// 🔄 Normalizamos los giros permitidos una sola vez
const GIROS_NORMALIZADOS = GIROS_PERMITIDOS.map(g => normalize(g));

const createCustomer = async (req, res) => {
  const { name, email, telefono, tipo_cliente, red_social, empresa, giro_empresa } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Nombre y correo son obligatorios' });
  }

  const validTypes = ['B2B', 'B2C'];
  if (tipo_cliente && !validTypes.includes(tipo_cliente)) {
    return res.status(400).json({ error: 'tipo_cliente debe ser B2B o B2C' });
  }

  if (tipo_cliente === 'B2B') {
    if (!empresa || !giro_empresa) {
      return res.status(400).json({ error: 'Empresa y giro son obligatorios para clientes B2B' });
    }

    if (!GIROS_NORMALIZADOS.includes(normalize(giro_empresa))) {
      return res.status(400).json({ error: 'Giro no permitido' });
    }
  }

  try {
    const result = await pool.query(
      `INSERT INTO customers (name, email, telefono, tipo_cliente, red_social, empresa, giro_empresa)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        name,
        email,
        telefono || null,
        tipo_cliente || null,
        red_social || null,
        tipo_cliente === 'B2B' ? empresa : null,
        tipo_cliente === 'B2B' ? giro_empresa : null
      ]
    );

    res.status(201).json({ customer: result.rows[0] });
  } catch (error) {
    console.error('🔥 Error al crear cliente:', error);
    res.status(500).json({ error: 'Error al crear cliente' });
  }
};

const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { name, email, telefono, tipo_cliente, red_social, empresa, giro_empresa } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Nombre y correo son obligatorios' });
  }

  const validTypes = ['B2B', 'B2C'];
  if (tipo_cliente && !validTypes.includes(tipo_cliente)) {
    return res.status(400).json({ error: 'tipo_cliente debe ser B2B o B2C' });
  }

  if (tipo_cliente === 'B2B') {
    if (!empresa || !giro_empresa) {
      return res.status(400).json({ error: 'Empresa y giro son obligatorios para clientes B2B' });
    }

    if (!GIROS_NORMALIZADOS.includes(normalize(giro_empresa))) {
      return res.status(400).json({ error: 'Giro no permitido' });
    }
  }

  try {
    const result = await pool.query(
      `UPDATE customers 
       SET name = $1, email = $2, telefono = $3, tipo_cliente = $4, red_social = $5, empresa = $6, giro_empresa = $7
       WHERE id = $8
       RETURNING *`,
      [
        name,
        email,
        telefono || null,
        tipo_cliente || null,
        red_social || null,
        tipo_cliente === 'B2B' ? empresa : null,
        tipo_cliente === 'B2B' ? giro_empresa : null,
        id
      ]
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

const getCustomers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers');
    res.json({ customers: result.rows });
  } catch (error) {
    console.error('🔥 Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
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
