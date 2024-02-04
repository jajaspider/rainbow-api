const mongoose = require("mongoose");

// Define Schemes
const mtcMetaSchema = new mongoose.Schema(
  {
    currency: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
    },
    percent_fee: {
      type: Number,
      required: true,
    },
    static_fee: {
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

module.exports = mongoose.model("MtcMeta", mtcMetaSchema);
