const mongoose = require('mongoose');

// Define Schemes
const noticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Create Model & Export
module.exports = mongoose.model('Notice', noticeSchema);