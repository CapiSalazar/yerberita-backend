require('dotenv').config();
const { Pool } = require('pg');

// ✅ Primero obtenemos la URL correctamente
const databaseUrl = process.env.DATABASE_URL;

// 💡 Mostrar todas las variables importantes
console.log('🌐 DATABASE_URL utilizada (valor crudo):', JSON.stringify(databaseUrl));
console.log('🧪 DEBUG - Variables de conexión:');
console.log('🌐 DATABASE_URL:', process.env.DATABASE_URL);
console.log('🔐 DB_HOST:', process.env.DB_HOST);
console.log('📛 DB_NAME:', process.env.DB_NAME);
console.log('👤 DB_USER:', process.env.DB_USER);
console.log('🔑 DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('🚪 DB_PORT:', process.env.DB_PORT);

if (!databaseUrl) {
  console.error("❌ DATABASE_URL no está definida. Verifica tus variables de entorno en Railway.");
  process.exit(1);
} else {
  console.log("🎯 DATABASE_URL detectada correctamente.");
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false, // necesario para Railway
  },
});

pool.connect()
  .then(() => console.log('✅ Conectado a PostgreSQL'))
  .catch((err) => {
    console.error('❌ Error en la conexión a PostgreSQL:');
    console.error('🌐 DATABASE_URL utilizada:', databaseUrl);
    console.error(err);
    process.exit(1);
  });

module.exports = pool;
