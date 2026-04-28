const express = require('express');
const Poliza = require('../models/Poliza');
const tiposSeguros = require('../data/tiposSeguros');

const router = express.Router();

/**
 * @swagger
 * /api/v1/polizas:
 *   get:
 *     summary: Listar todas las pólizas activas
 *     tags: [Gestión de Pólizas]
 *     responses:
 *       200:
 *         description: Lista de pólizas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Poliza'
 */
router.get('/', async (req, res, next) => {
  try {
    const polizas = await Poliza.find({ eliminada: false }).sort({ createdAt: -1 });
    res.json(polizas);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/polizas/{id}:
 *   get:
 *     summary: Obtener una póliza por su policyId
 *     tags: [Gestión de Pólizas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId de la póliza
 *         schema:
 *           type: string
 *           example: 64a7f3c2e1b2a3d4e5f67890
 *     responses:
 *       200:
 *         description: Póliza encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Poliza'
 *       404:
 *         description: Póliza no encontrada
 */
router.get('/:id', async (req, res, next) => {
  try {
    // ========================================================
    // BUG #2 — FALLO DE PERSISTENCIA (parte 2)
    // No se filtra por eliminada=false, por lo que una póliza
    // "borrada" sigue siendo accesible por su ID.
    // CORRECCIÓN: usar Poliza.findOne({ _id: req.params.id, eliminada: false })
    // ========================================================
    const poliza = await Poliza.findById(req.params.id);
    if (!poliza) {
      return res.status(404).json({ error: 'Póliza no encontrada' });
    }
    res.json(poliza);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/polizas:
 *   post:
 *     summary: Crear una nueva póliza
 *     tags: [Gestión de Pólizas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NuevaPoliza'
 *     responses:
 *       201:
 *         description: Póliza creada con policyId único generado por MongoDB
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Poliza'
 *       400:
 *         description: Datos inválidos o tipo de seguro no existe
 */
router.post('/', async (req, res, next) => {
  try {
    const { titular, tipoSeguro, edad } = req.body;

    if (!titular || !tipoSeguro || edad === undefined || edad === null) {
      return res.status(400).json({
        error: 'Los campos titular, tipoSeguro y edad son requeridos',
      });
    }

    const tipoEncontrado = tiposSeguros.find((t) => t.id === tipoSeguro);
    if (!tipoEncontrado) {
      return res.status(400).json({
        error: `Tipo de seguro '${tipoSeguro}' no existe`,
      });
    }

    const montoTotal =
      tipoEncontrado.montoBase * tipoEncontrado.factorRiesgo +
      tipoEncontrado.gastosAdministrativos;

    const poliza = await Poliza.create({ titular, tipoSeguro, edad, montoTotal });
    res.status(201).json(poliza);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/v1/polizas/{id}:
 *   delete:
 *     summary: Eliminar una póliza por su policyId
 *     tags: [Gestión de Pólizas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId de la póliza a eliminar
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Póliza eliminada correctamente
 *       404:
 *         description: Póliza no encontrada
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const poliza = await Poliza.findById(req.params.id);
    if (!poliza) {
      return res.status(404).json({ error: 'Póliza no encontrada' });
    }

    // ========================================================
    // BUG #2 — FALLO DE PERSISTENCIA
    // Solo marca los campos eliminada=true y vigente=false,
    // pero el documento PERMANECE en MongoDB (soft delete).
    // Al hacer GET /:id después, el documento aún existe → 200.
    // CORRECCIÓN: await Poliza.findByIdAndDelete(req.params.id);
    // ========================================================
    await Poliza.findByIdAndUpdate(req.params.id, {
      eliminada: true,
      vigente: false,
    });

    res.status(200).json({
      message: 'Póliza eliminada correctamente',
      policyId: req.params.id,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
