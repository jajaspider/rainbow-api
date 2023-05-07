const mongoose = require("mongoose");
const Types = mongoose.Schema.Types;

// Define Schemes
const monsterParkExpSchema = new mongoose.Schema(
  {
    level: {
      type: Types.String,
      required: true,
    },
    exp: {
      type: Types.Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create Model & Export
module.exports = mongoose.model("MonsterParkExp", monsterParkExpSchema);
