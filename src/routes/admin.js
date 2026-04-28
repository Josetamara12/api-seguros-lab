const express = require('express');
const Customer = require('../models/Customer');

const router = express.Router();

/**
 * @swagger
 * /api/v1/admin/customers:
 *   get:
 *     summary: Obtener todos los clientes registrados
 *     description: |
 *       **⚠️ ENDPOINT PROTEGIDO** — Requiere token de autorización Bearer.
 *
 *       Retorna la lista completa de clientes. Solo accesible para
 *       administradores autenticados.
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes (sin datos sensibles)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Customer'
 *       401:
 *         description: No autorizado — se requiere token Bearer válido
 */
router.get('/customers', async (req, res, next) => {
  try {
    // ========================================================
    // BUG #4 — FALLO DE SEGURIDAD
    // No se verifica el header Authorization antes de responder.
    // Cualquier cliente sin token puede acceder a datos sensibles.
    // CORRECCIÓN: descomentar el bloque siguiente:
    // --------------------------------------------------------
    // const authHeader = req.headers['authorization'];
    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //   return res.status(401).json({
    //     error: 'Acceso no autorizado. Se requiere token Bearer.',
    //   });
    // }
    // ========================================================

    // BUG adicional: se expone el campo 'password' de cada cliente.
    // CORRECCIÓN: Customer.find().select('-password')
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
