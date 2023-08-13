const mongoose = require("mongoose");
const Types = mongoose.Schema.Types;

// Define Schemes
const monsterParkExpSchema = new mongoose.Schema(
  {
    region: {
      type: Types.String,
    },
    level: {
      type: Types.String,
    },
    exp: {
      type: Types.Number,
      required: true,
    },
    extreme: {
      type: Types.Boolean,
      default: false,
    },
    needArcane: {
      type: Types.Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create Model & Export
module.exports = mongoose.model("MonsterParkExp", monsterParkExpSchema);
