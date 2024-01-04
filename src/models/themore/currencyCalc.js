const mongoose = require("mongoose");

const { CURRENCY_LIST } = require("../../core/constants");

// Define Schemes
const currencyCalcSchema = new mongoose.Schema(
  {
    currency: {
      type: String,
      required: true,
      enum: CURRENCY_LIST,
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

// Create Model & Export
module.exports = mongoose.model("CurrencyCalc", currencyCalcSchema);
