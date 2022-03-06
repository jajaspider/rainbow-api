const mongoose = require('mongoose');

const selectionSchema = require('./selection');
const noticeSchema = require('./notice');
const customImageSchema = require('./customImage');

// const Selection = mongoose.model('Selection', selectionSchema);

module.exports = {
    Selection: selectionSchema,
    Notice: noticeSchema,
    CustomImage: customImageSchema,
}