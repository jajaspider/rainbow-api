const mongoose = require("mongoose");
const Types = mongoose.Schema.Types;

// Define Schemes
const tmonSchema = new mongoose.Schema(
  {
    name: {
      type: Types.String,
      required: true,
    },
    uuid: {
      type: Types.Number,
      required: true,
      unique: true,
    },
    price: {
      type: Types.Number,
      required: true,
    },
    url: {
      type: Types.String,
      required: true,
    },
    isActive: {
      type: Types.Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create Model & Export
module.exports = mongoose.model("Tmon", tmonSchema);
