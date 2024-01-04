const mongoose = require("mongoose");

const { CURRENCY_LIST } = require("../../core/constants");

// Define Schemes
const currencyRangeSchema = new mongoose.Schema(
  {
    currency: {
      type: String,
      required: true,
      enum: CURRENCY_LIST,
    },
    from: {
      type: Number,
      required: true,
    },
    to: {
      type: Number,
      required: true,
    },
    point: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create Model & Export
module.exports = mongoose.model("CurrencyRange", currencyRangeSchema);
