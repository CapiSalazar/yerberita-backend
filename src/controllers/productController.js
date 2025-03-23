const pool = require('../config/db');

// ✅ Obtener productos activos
const getProducts = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products WHERE status = 'activo'");
    res.json({ products: result.rows });
  } catch (error) {
    console.error("🔥 Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

// ✅ Crear un nuevo producto con manejo correcto de costo_produccion
const createProduct = async (req, res) => {
    const { name, price, costo_produccion } = req.body;
  
    if (!name || !price) {
      return res.status(400).json({ error: "El nombre y el precio son obligatorios" });
    }
  
    try {
      const result = await pool.query(
        `INSERT INTO products (name, price, costo_produccion, status)
         VALUES ($1, $2, $3, 'activo')
         RETURNING *`,
        [name, price, costo_produccion || 0]  // <-- ✅ Aquí se asegura valor numérico
      );
  
      res.status(201).json({ product: result.rows[0] });
    } catch (error) {
      console.error("🔥 Error al crear producto:", error);
      res.status(500).json({ error: "Error al crear producto" });
    }
  };
  

// ✅ Actualizar un producto (incluye costo_produccion)
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, costo_produccion } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: "El nombre y el precio son obligatorios" });
  }

  const costoReal = costo_produccion ? parseFloat(costo_produccion) : 0;

  try {
    const result = await pool.query(
      `UPDATE products
       SET name = $1, price = $2, costo_produccion = $3
       WHERE id = $4
       RETURNING *`,
      [name, price, costoReal, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({ product: result.rows[0] });
  } catch (error) {
    console.error("🔥 Error al actualizar producto:", error);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
};

// ✅ Soft delete
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "UPDATE products SET status = 'inactivo' WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({ message: "Producto marcado como inactivo", product: result.rows[0] });
  } catch (error) {
    console.error("🔥 Error al eliminar producto:", error);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
};

// 📦 Exports
module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
