const mongoose = require("mongoose");

const { CURRENCY_LIST } = require("../core/constants");

// Define Schemes
const foreignRateSchema = new mongoose.Schema(
  {
    from_currency: {
      type: String,
      required: true,
      enum: CURRENCY_LIST,
    },
    to_currency: {
      type: String,
      required: true,
      enum: CURRENCY_LIST,
    },
    rate: {
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
module.exports = mongoose.model("ForeignRate", foreignRateSchema);
