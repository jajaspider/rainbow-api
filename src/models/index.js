const mongoose = require("mongoose");

const selectionSchema = require("./selection");
const noticeSchema = require("./notice");
const customImageSchema = require("./customImage");
const mapleClassSchema = require("./mapleClass");
const lostarkCharacterSchema = require("./lostarkCharacter");
const questExpSchema = require("./questExp");
const levelExpSchema = require("./levelExp");
const monsterParkExpSchema = require("./monsterParkExp");
const SymbolSchema = require("./symbol");

const ocidSchema = require("./maplestory/ocid");
const maplestoryCharacterSchema = require("./maplestory/characterInfo");

const foreignRateSchema = require("./themore/foreignRate");
const currencyRangeSchema = require("./themore/currencyRange");
const currencyCalcSchema = require("./themore/currencyCalc");
const moogoldSchema = require("./themore/moogold");
const moogoldMetaSchema = require("./themore/moogoldMeta");
const currencySchema = require("./themore/currency");
const offgamerSchema = require("./themore/offgamer");
const offgamerMetaSchema = require("./themore/offgamerMeta");

// const Selection = mongoose.model('Selection', selectionSchema);

module.exports = {
  Selection: selectionSchema,
  Notice: noticeSchema,
  CustomImage: customImageSchema,
  MapleClass: mapleClassSchema,
  LostarkCharacter: lostarkCharacterSchema,
  QuestExp: questExpSchema,
  LevelExp: levelExpSchema,
  MonsterParkExp: monsterParkExpSchema,
  Symbol: SymbolSchema,
  Ocid: ocidSchema,
  MaplestoryCharacter: maplestoryCharacterSchema,
  ForeignRate: foreignRateSchema,
  CurrencyRange: currencyRangeSchema,
  CurrencyCalc: currencyCalcSchema,
  Moogold: moogoldSchema,
  MoogoldMeta: moogoldMetaSchema,
  Currency: currencySchema,
  Offgamer: offgamerSchema,
  OffgamerMeta: offgamerMetaSchema,
};
