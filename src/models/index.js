const mongoose = require('mongoose');

const selectionSchema = require('./selection');
const noticeSchema = require('./notice');
const customImageSchema = require('./customImage');
const mapleClassSchema = require('./maplestory/mapleClass');
const lostarkCharacterSchema = require('./lostark/lostarkCharacter');
const bossSchema = require('./boss');

// const Selection = mongoose.model('Selection', selectionSchema);

module.exports = {
    Selection: selectionSchema,
    Notice: noticeSchema,
    CustomImage: customImageSchema,
    MapleClass: mapleClassSchema,
    LostarkCharacter: lostarkCharacterSchema,
    Boss: bossSchema
}