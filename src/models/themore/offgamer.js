const mongoose = require("mongoose");

// Define Schemes
const offgamerSchema = new mongoose.Schema(
  {
    currency: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
    },
    origin_amount: {
      type: Number,
      required: true,
    },
    currency_amount: {
      type: Number,
      required: true,
    },
    krw_amount: {
      type: Number,
      required: true,
    },
    product_url: {
      type: String,
    },
    product_name: {
      type: String,
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

module.exports = mongoose.model("Offgamer", offgamerSchema);
