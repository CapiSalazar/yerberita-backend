require('dotenv').config();
const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL no está definida. Verifica tus variables de entorno en Railway.");
  process.exit(1); // Detener la ejecución si no hay URL
} else {
  console.log("🎯 DATABASE_URL detectada correctamente.");
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false, // Necesario para conexiones externas como Railway
  },
});

pool.connect()
  .then(() => console.log('✅ Conectado a PostgreSQL'))
  .catch((err) => {
    console.error('❌ Error en la conexión a PostgreSQL:', err);
    process.exit(1); // Salir si falla la conexión
  });

module.exports = pool;
