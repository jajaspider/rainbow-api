const mongoose = require('mongoose');

const selectionSchema = require('./selection');
const noticeSchema = require('./notice');
const customImageSchema = require('./customImage');
const mapleClassSchema = require('./mapleClass');
const lostarkCharacterSchema = require('./lostarkCharacter');
const questExpSchema = require('./questExp');
const levelExpSchema = require('./levelExp');

// const Selection = mongoose.model('Selection', selectionSchema);

module.exports = {
    Selection: selectionSchema,
    Notice: noticeSchema,
    CustomImage: customImageSchema,
    MapleClass: mapleClassSchema,
    LostarkCharacter: lostarkCharacterSchema,
    QuestExp:questExpSchema,
    LevelExp:levelExpSchema
}