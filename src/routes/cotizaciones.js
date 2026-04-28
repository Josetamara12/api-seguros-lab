const express = require('express');
const tiposSeguros = require('../data/tiposSeguros');

const router = express.Router();

/**
 * @swagger
 * /api/v1/cotizar:
 *   post:
 *     summary: Realizar una cotización de seguro en tiempo real
 *     description: |
 *       Calcula el monto anual de una póliza según la fórmula:
 *       **Total = (MontoBase × FactorRiesgo) + GastosAdministrativos**
 *
 *       **Restricción de negocio:** El Seguro de Vida solo está disponible
 *       para personas entre 18 y 65 años.
 *
 *       **Campos requeridos:** `tipoSeguro`, `edad`, `titular`
 *     tags: [Cotizaciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SolicitudCotizacion'
 *           examples:
 *             auto_valido:
 *               summary: Cotización de Auto (válida)
 *               value: { tipoSeguro: "auto", edad: 30, titular: "Juan Pérez" }
 *             vida_valido:
 *               summary: Cotización de Vida (edad válida)
 *               value: { tipoSeguro: "vida", edad: 35, titular: "María Torres" }
 *             vida_menor:
 *               summary: "[BUG #1] Seguro de Vida — menor de edad (debe rechazar)"
 *               value: { tipoSeguro: "vida", edad: 15, titular: "Pedro Menor" }
 *             vida_imposible:
 *               summary: "[BUG #1] Seguro de Vida — edad imposible (debe rechazar)"
 *               value: { tipoSeguro: "vida", edad: 200, titular: "Inmortal S.A." }
 *             vida_negativa:
 *               summary: "[BUG #1] Seguro de Vida — edad negativa (debe rechazar)"
 *               value: { tipoSeguro: "vida", edad: -30, titular: "Negativo S.A." }
 *             body_vacio:
 *               summary: "[BUG #3] Body vacío (debe rechazar con 400)"
 *               value: {}
 *     responses:
 *       200:
 *         description: Cotización calculada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cotizacion'
 *       400:
 *         description: Datos inválidos, tipo de seguro no existe o restricción de negocio incumplida
 */
router.post('/', (req, res, next) => {
  try {
    const { tipoSeguro, edad, titular } = req.body;

    // ============================================================
    // BUG #3 — FALLO DE INTEGRIDAD
    // Los campos requeridos NO se validan. Si el body llega vacío
    // o incompleto, el sistema igual procesa la solicitud y
    // retorna 200 con montoTotal: 0 (dato inválido como válido).
    //
    // CORRECCIÓN esperada: descomentar el bloque de validación:
    // ------------------------------------------------------------
    // if (!tipoSeguro || edad === undefined || edad === null || !titular) {
    //   return res.status(400).json({
    //     error: 'Los campos tipoSeguro, edad y titular son requeridos',
    //   });
    // }
    // ============================================================

    const tipoEncontrado = tiposSeguros.find((t) => t.id === tipoSeguro);

    // BUG #3 continúa: si tipoSeguro no existe en el catálogo (o es undefined),
    // en lugar de rechazar con 400, se destrucura un objeto vacío y el cálculo
    // produce montoTotal: 0, retornando igualmente 200.
    const {
      montoBase = 0,
      factorRiesgo = 0,
      gastosAdministrativos = 0,
      descripcion = null,
    } = tipoEncontrado || {};

    // ============================================================
    // BUG #1 — FALLO DE VALIDACIÓN
    // La regla de negocio exige que el Seguro de Vida solo se
    // ofrezca a personas entre 18 y 65 años. La validación está
    // COMENTADA, por lo que acepta edades 15, -30, 200, etc.
    //
    // CORRECCIÓN esperada: descomentar el bloque siguiente:
    // ------------------------------------------------------------
    // if (tipoSeguro === 'vida' && (edad < 18 || edad > 65)) {
    //   return res.status(400).json({
    //     error: 'El Seguro de Vida solo está disponible para personas entre 18 y 65 años',
    //   });
    // }
    // ============================================================

    const montoTotal = montoBase * factorRiesgo + gastosAdministrativos;

    res.json({
      titular,
      tipoSeguro,
      edad,
      montoBase,
      factorRiesgo,
      gastosAdministrativos,
      montoTotal,
      descripcion,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
