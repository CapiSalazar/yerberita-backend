const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController'); // ✅ Importar funciones correctamente

console.log("🔍 Tipo de authMiddleware:", typeof authMiddleware);
console.log("🔍 Tipo de getProducts:", typeof getProducts);

const router = express.Router();

// Rutas de productos
router.get('/', authMiddleware, getProducts);
router.post('/', authMiddleware, createProduct);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

module.exports = router;
