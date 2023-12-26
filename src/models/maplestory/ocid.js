const mongoose = require("mongoose");

// Define Schemes
const ocidSchema = new mongoose.Schema(
  {
    characterName: {
      type: String,
      required: true,
    },
    ocid: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create Model & Export
module.exports = mongoose.model("Ocid", ocidSchema);
