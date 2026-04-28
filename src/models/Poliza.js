const mongoose = require('mongoose');

const polizaSchema = new mongoose.Schema(
  {
    titular: { type: String, required: true, trim: true },
    tipoSeguro: {
      type: String,
      enum: ['vida', 'auto', 'hogar', 'salud'],
      required: true,
    },
    edad: { type: Number, required: true },
    montoTotal: { type: Number, required: true },
    vigente: { type: Boolean, default: true },
    eliminada: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Poliza', polizaSchema);
