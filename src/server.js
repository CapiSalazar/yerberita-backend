// Carga variables de entorno si no es producción
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
  console.log("🔍 Archivo .env cargado en desarrollo.");
}

console.log("🔍 Archivo .env cargado correctamente.");

const express = require('express');
const cors = require('cors');

const allowedOrigins = [
  'http://localhost:3000',                 // Dev local
  'https://admin.yerberita.com',          // Frontend en producción
];

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reportRoutes = require('./routes/reportRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const customerRoutes = require('./routes/customerRoutes');

const app = express();

// ✅ Middleware CORS actualizado
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('❌ No autorizado por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

app.use(express.json());

// ✅ Rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/customers', customerRoutes);

// Ruta de prueba
app.get('/test', (req, res) => {
  res.json({ message: "El servidor está activo y funcionando correctamente" });
});

// ✅ Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 Servidor corriendo en http://localhost:${PORT}`);
});
