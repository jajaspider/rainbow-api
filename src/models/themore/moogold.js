const mongoose = require("mongoose");

// Define Schemes
const moogoldSchema = new mongoose.Schema(
  {
    currency: {
      type: String,
      required: true,
    },
    currencyAmount: {
      type: Number,
      required: true,
    },
    krwAmount: {
      type: Number,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Moogold", moogoldSchema);
