const mongoose = require('mongoose');

// Define Schemes
const lostarkCharacterSchema = new mongoose.Schema({
    name: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    character: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Create Model & Export
module.exports = mongoose.model('LostarkCharacter', lostarkCharacterSchema);