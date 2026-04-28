const express = require('express');
const tiposSeguros = require('../data/tiposSeguros');

const router = express.Router();

/**
 * @swagger
 * /api/v1/tipos-seguro:
 *   get:
 *     summary: Obtener todos los tipos de seguro disponibles
 *     tags: [Consultas]
 *     responses:
 *       200:
 *         description: Lista de tipos de seguro con sus tarifas base
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TipoSeguro'
 */
router.get('/', (req, res) => {
  res.json(tiposSeguros);
});

module.exports = router;
