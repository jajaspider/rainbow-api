const mongoose = require('mongoose');

// Define Schemes
const bossSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    level: {
        type: String,
        required: true
    },
    money: {
        type: Number,
        required: true
    },
    game: {
        type: mongoose.Schema.Types.String,
        enum: ["lostark", "maplestory"]
    },
    rewards: {
        type: mongoose.Schema.Types.Array,
        required: true
    }
}, {
    timestamps: true
});

// Create Model & Export
module.exports = mongoose.model('Boss', bossSchema);