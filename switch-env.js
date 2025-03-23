// switch-env.js
const fs = require('fs');
const path = require('path');

const env = process.argv[2];

const targetFile = path.join(__dirname, '.env');

const envFiles = {
  local: path.join(__dirname, '.env.local'),
  production: path.join(__dirname, '.env.production'),
};

if (!env || !envFiles[env]) {
  console.error("❌ Debes especificar 'local' o 'production'. Ej: node switch-env.js local");
  process.exit(1);
}

fs.copyFile(envFiles[env], targetFile, (err) => {
  if (err) {
    console.error("❌ Error al cambiar el entorno:", err);
  } else {
    console.log(`✅ Archivo .env actualizado para entorno: ${env}`);
  }
});
