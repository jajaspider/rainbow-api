const mongoose = require('mongoose');

// Define Schemes
const customImageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    imageW: {
        type: String,
        required: true
    },
    imageH: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});

// Create Model & Export
module.exports = mongoose.model('CustomImage', customImageSchema);