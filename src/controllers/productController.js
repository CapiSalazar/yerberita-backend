const pool = require('../config/db');

// Obtener todos los productos
const getProducts = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM products WHERE status = 'activo'");
        res.json({ products: result.rows });
    } catch (error) {
        console.error("🔥 Error al obtener productos:", error);
        res.status(500).json({ error: "Error al obtener productos" });
    }
};


// Crear un nuevo producto
const createProduct = async (req, res) => {
    const { name, price } = req.body;

    if (!name || !price) {
        return res.status(400).json({ error: "El nombre y el precio son obligatorios" });
    }

    try {
        const result = await pool.query(
            'INSERT INTO products (name, price) VALUES ($1, $2) RETURNING *',
            [name, price]
        );

        res.status(201).json({ product: result.rows[0] });
    } catch (error) {
        console.error("🔥 Error al crear producto:", error);
        res.status(500).json({ error: "Error al crear producto" });
    }
};

// Actualizar un producto
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;

    if (!name || !price) {
        return res.status(400).json({ error: "El nombre y el precio son obligatorios" });
    }

    try {
        const result = await pool.query(
            'UPDATE products SET name = $1, price = $2 WHERE id = $3 RETURNING *',
            [name, price, id]
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

// Eliminar un producto
const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "UPDATE products SET status = 'inactivo' WHERE id = $1 RETURNING *",
            [id]
        );

        console.log("🔍 Resultado del Soft Delete:", result.rows); // <-- Debugging

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        res.json({ message: "Producto marcado como inactivo", product: result.rows[0] });
    } catch (error) {
        console.error("🔥 Error al marcar producto como inactivo:", error);
        res.status(500).json({ error: "Error al eliminar producto" });
    }
};


// ✅ Asegurar que exportamos funciones correctamente
module.exports = {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct
};
