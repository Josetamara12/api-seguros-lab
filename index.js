require('dotenv').config();
const { start } = require('./src/server');

start().catch((err) => {
  console.error('No se pudo iniciar el servidor:', err);
  process.exit(1);
});
