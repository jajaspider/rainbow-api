const mongoose = require("mongoose");

// Define Schemes
const alarmSchema = new mongoose.Schema(
  {
    chat_id: {
      type: String,
    },
    id: {
      type: Number,
    },
    brandId: {
      type: Number,
    },
    active: {
      type: Boolean,
      default: true,
    },
    price: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Create Model & Export
module.exports = mongoose.model("NCNCAlarm", alarmSchema);
