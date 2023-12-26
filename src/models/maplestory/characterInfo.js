const mongoose = require("mongoose");

// Define Schemes
const characterSchema = new mongoose.Schema(
  {
    ocid: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    character_name: {
      type: String,
      required: true,
    },
    world_name: {
      type: String,
      required: true,
    },
    character_gender: {
      type: String,
      required: true,
    },
    character_class: {
      type: String,
      required: true,
    },
    character_class_level: {
      type: String,
      required: true,
    },
    character_level: {
      type: Number,
      required: true,
    },
    character_exp: {
      type: Number,
      required: true,
    },
    character_exp_rate: {
      type: String,
      required: true,
    },
    character_guild_name: {
      type: String,
      required: true,
    },
    character_image: {
      type: String,
      required: true,
    },
    popularity: {
      type: Number,
      required: true,
    },
    final_stat: {
      type: mongoose.Schema.Types.Mixed,
    },
    dojang_best_floor: {
      type: Number,
      required: true,
    },
    date_dojang_record: {
      type: Date,
      required: true,
    },
    dojang_best_time: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create Model & Export
module.exports = mongoose.model("MaplestoryCharacter", characterSchema);
