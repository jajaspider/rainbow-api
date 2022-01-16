const mongoose = require('mongoose');

const selectionSchema = require('./selection');

// const Selection = mongoose.model('Selection', selectionSchema);

module.exports = {
    Selection: selectionSchema,
}