const mongoose = require("mongoose");

// Define Schemes
const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      index: true,
    },
    id: {
      type: Number,
    },
    brandName: {
      type: String,
    },
    brandId: {
      type: Number,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Create Model & Export
module.exports = mongoose.model("NCNCItem", itemSchema);
