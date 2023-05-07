const mongoose = require("mongoose");
const Types = mongoose.Schema.Types;

// Define Schemes
const levelExpSchema = new mongoose.Schema(
  {
    level: {
      type: Types.String,
      required: true,
    },
    needExp: {
      type: Types.Number,
      required: true,
    },
    totalExp: {
      type: Types.Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create Model & Export
module.exports = mongoose.model("LevelExp", levelExpSchema);
