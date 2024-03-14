const mongoose = require("mongoose");

// Define Schemes
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    id: {
      type: Number,
    },
    categoryId: {
      type: Number,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Create Model & Export
module.exports = mongoose.model("NCNCBrand", categorySchema);
