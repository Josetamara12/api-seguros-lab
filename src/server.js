const app = require('./app');
const { connectDb } = require('./config/db');
const Customer = require('./models/Customer');

const SEED_CUSTOMERS = [
  {
    nombre: 'Carlos Ramírez',
    cedula: '1020304050',
    email: 'carlos@seguros.com',
    telefono: '3001234567',
    password: '$2b$10$hash_secreto_no_exponer_123',
  },
  {
    nombre: 'Laura Gómez',
    cedula: '1030405060',
    email: 'laura@seguros.com',
    telefono: '3009876543',
    password: '$2b$10$hash_secreto_no_exponer_456',
  },
  {
    nombre: 'Andrés Martínez',
    cedula: '1040506070',
    email: 'andres@seguros.com',
    telefono: '3005551234',
    password: '$2b$10$hash_secreto_no_exponer_789',
  },
];

async function seedCustomers() {
  const count = await Customer.countDocuments();
  if (count === 0) {
    await Customer.insertMany(SEED_CUSTOMERS);
    console.log(`[Seed] ${SEED_CUSTOMERS.length} clientes de prueba insertados en DB`);
  }
}

async function start() {
  const port = Number(process.env.PORT) || 3000;
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('Falta MONGODB_URI en las variables de entorno');
    process.exit(1);
  }

  await connectDb(uri);
  await seedCustomers();

  app.listen(port, () => {
    console.log(`\n  ✅ API corriendo en   http://localhost:${port}`);
    console.log(`  📖 Swagger UI en      http://localhost:${port}/api-docs\n`);
  });
}

module.exports = { start };
