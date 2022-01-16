const mongoose = require('mongoose');

// Define Schemes
const selectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Create Model & Export
module.exports = mongoose.model('Selection', selectionSchema);