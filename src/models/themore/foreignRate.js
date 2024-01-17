const mongoose = require("mongoose");
const Types = mongoose.Schema.Types;

// Define Schemes
const foreignRateSchema = new mongoose.Schema(
  {
    from_currency: {
      type: String,
      required: true,
    },
    to_currency: {
      type: String,
      required: true,
    },
    rate: {
      type: Number,
      required: true,
    },
    notice_time: {
      type: String,
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
