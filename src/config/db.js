const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    console.log("URI usada:", process.env.MONGODB_URI); // 👈 DEBUG

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Conectado a MongoDB");
  } catch (error) {
    console.error("Error de conexión:", error);
    process.exit(1);
  }
};

module.exports = connectDb;