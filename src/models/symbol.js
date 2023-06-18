const mongoose = require("mongoose");
const Types = mongoose.Schema.Types;

// Define Schemes
const symbolSchema = new mongoose.Schema(
  {
    type: {
      type: Types.String,
      required: true,
    },
    subType: {
      type: Types.String,
      required: true,
    },
    level: {
      type: Types.Number,
      required: true,
    },
    requireSymbol: {
      type: Types.Number,
      required: true,
    },
    requireMeso: {
      type: Types.Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create Model & Export
module.exports = mongoose.model("Symbol", symbolSchema);
