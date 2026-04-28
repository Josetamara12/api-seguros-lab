const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swaggerConfig');

const tiposSegurosRouter = require('./routes/tiposSeguros');
const cotizacionesRouter = require('./routes/cotizaciones');
const polizasRouter = require('./routes/polizas');
const adminRouter = require('./routes/admin');

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Seguros PascualB — API Docs',
    swaggerOptions: { persistAuthorization: true },
  })
);

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'segurospascualb-api', version: '1.0.0-beta' });
});

app.use('/api/v1/tipos-seguro', tiposSegurosRouter);
app.use('/api/v1/cotizar', cotizacionesRouter);
app.use('/api/v1/polizas', polizasRouter);
app.use('/api/v1/admin', adminRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'ID inválido' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
