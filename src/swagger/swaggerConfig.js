const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Seguros PascualB — API Core',
      version: '1.0.0-beta',
      description: `
## API Core — Beta 1.0

API REST para la gestión digital del proceso de venta de seguros de **Seguros PascualB**.

### Endpoints disponibles
| Módulo | Descripción |
|--------|-------------|
| Consultas | Consultar tipos de seguros disponibles |
| Cotizaciones | Calcular cotización en tiempo real |
| Gestión de Pólizas | CRUD completo de pólizas de clientes |
| Admin | Gestión de clientes (requiere autorización) |

### Reglas de Negocio
- **Seguro de Vida**: Solo disponible para personas entre **18 y 65** años.
- **Cálculo de Cotización**: \`Total = (MontoBase × FactorRiesgo) + GastosAdministrativos\`
- **Identificadores**: Todas las pólizas retornan un \`_id\` único (MongoDB ObjectId).
- **Seguridad**: \`GET /api/v1/admin/customers\` requiere token Bearer válido.
      `,
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Servidor local (Docker)' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        TipoSeguro: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'vida' },
            nombre: { type: 'string', example: 'Seguro de Vida' },
            descripcion: { type: 'string' },
            montoBase: { type: 'number', example: 500000 },
            factorRiesgo: { type: 'number', example: 1.5 },
            gastosAdministrativos: { type: 'number', example: 50000 },
            restricciones: { type: 'string', nullable: true },
          },
        },
        SolicitudCotizacion: {
          type: 'object',
          required: ['tipoSeguro', 'edad', 'titular'],
          properties: {
            tipoSeguro: {
              type: 'string',
              enum: ['vida', 'auto', 'hogar', 'salud'],
              example: 'auto',
            },
            edad: { type: 'integer', minimum: 0, example: 30 },
            titular: { type: 'string', example: 'Juan Pérez' },
          },
        },
        Cotizacion: {
          type: 'object',
          properties: {
            titular: { type: 'string' },
            tipoSeguro: { type: 'string' },
            edad: { type: 'integer' },
            montoBase: { type: 'number' },
            factorRiesgo: { type: 'number' },
            gastosAdministrativos: { type: 'number' },
            montoTotal: {
              type: 'number',
              description: 'Total = (MontoBase × FactorRiesgo) + GastosAdministrativos',
            },
            descripcion: { type: 'string' },
          },
        },
        NuevaPoliza: {
          type: 'object',
          required: ['titular', 'tipoSeguro', 'edad'],
          properties: {
            titular: { type: 'string', example: 'María González' },
            tipoSeguro: {
              type: 'string',
              enum: ['vida', 'auto', 'hogar', 'salud'],
              example: 'salud',
            },
            edad: { type: 'integer', example: 35 },
          },
        },
        Poliza: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'policyId único generado por MongoDB (ObjectId)',
              example: '64a7f3c2e1b2a3d4e5f67890',
            },
            titular: { type: 'string' },
            tipoSeguro: { type: 'string' },
            edad: { type: 'integer' },
            montoTotal: { type: 'number' },
            vigente: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Customer: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            nombre: { type: 'string', example: 'Carlos Ramírez' },
            cedula: { type: 'string', example: '1020304050' },
            email: { type: 'string', example: 'carlos@example.com' },
            telefono: { type: 'string', example: '3001234567' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
