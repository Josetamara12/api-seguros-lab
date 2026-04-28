const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  cedula: { type: String, required: true },
  email: { type: String, required: true },
  telefono: { type: String },
  password: { type: String },
});

module.exports = mongoose.model('Customer', customerSchema);
