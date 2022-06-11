const mongoose = require('mongoose');

// Define Schemes
const classSchema = new mongoose.Schema({
    className: {
        type: String,
        required: true
    },
    classStat: {
        type: String,
        required: true
    },
    classGroup: {
        type: String,
        required: true
    },
    classType: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});

// Create Model & Export
module.exports = mongoose.model('MapleClass', classSchema);