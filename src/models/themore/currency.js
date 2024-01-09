const mongoose = require("mongoose");

// Define Schemes
const currencySchema = new mongoose.Schema(
  {
    currency: {
      type: String,
      required: true,
      unique: true,
    },
    currencyDisplay: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create Model & Export
module.exports = mongoose.model("Currency", currencySchema);
