const mongoose = require("mongoose");
const Types = mongoose.Schema.Types;

// Define Schemes
const questExpSchema = new mongoose.Schema(
  {
    region: {
      type: Types.String,
      required: true,
    },
    exp: {
      type: Types.Number,
      required: true,
    },
    subExp: {
      type: Types.Number,
      required: true,
    },
    continent: {
      type: Types.String,
      required: true,
    },
    requireLevel: {
      type: Types.Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create Model & Export
module.exports = mongoose.model("QuestExp", questExpSchema);
