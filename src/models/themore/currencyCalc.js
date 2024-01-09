const mongoose = require("mongoose");
const Types = mongoose.Schema.Types;

// Define Schemes
const currencyCalcSchema = new mongoose.Schema(
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
    krwAmountDisplay: {
      type: String,
      required: true,
    },
    efficiency: {
      type: Number,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    origin: {
      type: Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Create Model & Export
module.exports = mongoose.model("CurrencyCalc", currencyCalcSchema);
