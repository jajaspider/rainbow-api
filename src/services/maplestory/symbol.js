const _ = require("lodash");
const axios = require("axios");
const cheerio = require("cheerio");

const DB = require("../../models");
const Symbol = DB.Symbol;

const utils = require("../../utils");
const { ERROR_CODE, RainbowError } = require("../../core/constants");

const SYMBOL_REGION = {
  JOURNEY: "Journey",
  CHUCHU: "Chuchu",
  LACHELEIN: "Lachelein",
  ARCANA: "Arcana",
  MORASS: "Morass",
  ESFERA: "Esfera",
  CERNIUM: "Cernium",
  ARCUS: "Arcus",
  ODIUM: "Odium",
  SHANGRILA: "ShangriLa",
};

async function getSymbolCalc(startLevel, endLevel) {
  // 시작레벨 보다 종료 레벨이 적거나
  // 시작레벨이 20이상이거나
  // 시작레벨이 1미만이거나
  // 종료레벨이 20초과이거나
  // 종료레벨이 1이하이거나
  let result = {
    requireArcaneSymbol: 0,
    journeyMeso: 0,
    chuchuMeso: 0,
    lacheleinMeso: 0,
    arcanaMeso: 0,
    morassMeso: 0,
    esferaMeso: 0,
    requireAthenticSymbol: 0,
    cerniumMeso: 0,
    arcusMeso: 0,
    odiumMeso: 0,
    shangriLaMeso: 0,
  };

  if (
    startLevel >= endLevel ||
    startLevel >= 20 ||
    startLevel < 1 ||
    endLevel > 20 ||
    endLevel <= 1
  ) {
    throw new RainbowError({
      httpCode: 422,
      error: ERROR_CODE.INVALID_PARAMETER,
      reason: `not support parameter startLeve:${startLevel}, endLevel:${endLevel}`,
    });
  }

  // 어센틱 데이터는 반환하지않아도 됨
  if (endLevel <= 11) {
    let AthenticResult = await Symbol.find({
      type: "Athentic",
      level: { $gte: startLevel, $lte: endLevel },
    });
    AthenticResult = utils.toJSON(AthenticResult);

    for (let _athentic of AthenticResult) {
      result.requireAthenticSymbol += _athentic.requireSymbol;
      // 세르니움
      if (_athentic.subType == SYMBOL_REGION.CERNIUM) {
        result.cerniumMeso += _athentic.requireMeso;
      }
      // 아르크스
      else if (_athentic.subType == SYMBOL_REGION.ARCUS) {
        result.arcusMeso += _athentic.requireMeso;
      }
      // 오디움
      else if (_athentic.subType == SYMBOL_REGION.ODIUM) {
        result.odiumMeso += _athentic.requireMeso;
      }
      // 도원경
      else if (_athentic.subType == SYMBOL_REGION.SHANGRILA) {
        result.shangriLaMeso += _athentic.requireMeso;
      }
    }
    result.requireAthenticSymbol /= 4;
  }

  let arcaneResult = await Symbol.find({
    type: "Arcane",
    level: { $gte: startLevel, $lte: endLevel },
  });
  arcaneResult = utils.toJSON(arcaneResult);

  for (let _arcane of arcaneResult) {
    result.requireArcaneSymbol += _arcane.requireSymbol;
    // 여로
    if (_arcane.subType == SYMBOL_REGION.JOURNEY) {
      result.journeyMeso += _arcane.requireMeso;
    }
    // 츄츄
    else if (_arcane.subType == SYMBOL_REGION.CHUCHU) {
      result.chuchuMeso += _arcane.requireMeso;
    }
    // 레헬른
    else if (_arcane.subType == SYMBOL_REGION.LACHELEIN) {
      result.lacheleinMeso += _arcane.requireMeso;
    }
    // 아르카나
    else if (_arcane.subType == SYMBOL_REGION.ARCANA) {
      result.arcanaMeso += _arcane.requireMeso;
    }
    // 모라스
    else if (_arcane.subType == SYMBOL_REGION.MORASS) {
      result.morassMeso += _arcane.requireMeso;
    }
    // 에스페라
    else if (_arcane.subType == SYMBOL_REGION.ESFERA) {
      result.esferaMeso += _arcane.requireMeso;
    }
  }
  result.requireArcaneSymbol /= 6;

  return result;
}

// pre execute
async function countOflevel() {
  let arcane = {
    1: {
      requireArcaneSymbol: 0,
      journeyMeso: 0,
      chuchuMeso: 0,
      lacheleinMeso: 0,
      arcanaMeso: 0,
      morassMeso: 0,
      esferaMeso: 0,
    },
  };
  let athentic = {
    1: {
      requireAthenticSymbol: 0,
      cerniumMeso: 0,
      arcusMeso: 0,
      odiumMeso: 0,
      shangriLaMeso: 0,
    },
  };

  for (let i = 1; i < 20; i += 1) {
    arcane[i + 1] = {
      requireArcaneSymbol: Math.pow(i, 2) + 11,
      journeyMeso:
        Math.floor(Math.pow(i, 3) * 0.1 + Math.pow(i, 2) * 8 + i * 1.1 + 88) *
        10000,
      chuchuMeso:
        Math.floor(Math.pow(i, 3) * 0.1 + Math.pow(i, 2) * 10 + i * 1.1 + 110) *
        10000,
      lacheleinMeso:
        Math.floor(Math.pow(i, 3) * 0.1 + Math.pow(i, 2) * 12 + i * 1.1 + 132) *
        10000,
      arcanaMeso:
        Math.floor(Math.pow(i, 3) * 0.1 + Math.pow(i, 2) * 14 + i * 1.1 + 154) *
        10000,
      morassMeso:
        Math.floor(Math.pow(i, 3) * 0.1 + Math.pow(i, 2) * 16 + i * 1.1 + 176) *
        10000,
      esferaMeso:
        Math.floor(Math.pow(i, 3) * 0.1 + Math.pow(i, 2) * 18 + i * 1.1 + 198) *
        10000,
    };
  }

  for (let i = 1; i < 11; i += 1) {
    athentic[i + 1] = {
      requireAthenticSymbol: Math.pow(i, 2) * 9 + 20 * i,
      cerniumMeso:
        Math.floor(Math.pow(i, 3) * -5.4 + Math.pow(i, 2) * 106.8 + i * 264) *
        100000,
      arcusMeso:
        Math.floor(Math.pow(i, 3) * -5.4 + Math.pow(i, 2) * 123 + i * 300) *
        100000,
      odiumMeso:
        Math.floor(Math.pow(i, 3) * -5.4 + Math.pow(i, 2) * 139.2 + i * 336) *
        100000,
      shangriLaMeso:
        Math.floor(Math.pow(i, 3) * -5.4 + Math.pow(i, 2) * 155.4 + i * 372) *
        100000,
    };
  }

  let arcanes = _.keys(arcane);
  for (let _arcane of arcanes) {
    // console.dir(arcane[_arcane]);
    await Symbol.create({
      type: "Arcane",
      subType: "Journey",
      level: _arcane,
      requireSymbol: arcane[_arcane].requireArcaneSymbol,
      requireMeso: arcane[_arcane].journeyMeso,
    });

    await Symbol.create({
      type: "Arcane",
      subType: "Chuchu",
      level: _arcane,
      requireSymbol: arcane[_arcane].requireArcaneSymbol,
      requireMeso: arcane[_arcane].chuchuMeso,
    });

    await Symbol.create({
      type: "Arcane",
      subType: "Lachelein",
      level: _arcane,
      requireSymbol: arcane[_arcane].requireArcaneSymbol,
      requireMeso: arcane[_arcane].lacheleinMeso,
    });

    await Symbol.create({
      type: "Arcane",
      subType: "Arcana",
      level: _arcane,
      requireSymbol: arcane[_arcane].requireArcaneSymbol,
      requireMeso: arcane[_arcane].arcanaMeso,
    });

    await Symbol.create({
      type: "Arcane",
      subType: "Morass",
      level: _arcane,
      requireSymbol: arcane[_arcane].requireArcaneSymbol,
      requireMeso: arcane[_arcane].morassMeso,
    });

    await Symbol.create({
      type: "Arcane",
      subType: "Esfera",
      level: _arcane,
      requireSymbol: arcane[_arcane].requireArcaneSymbol,
      requireMeso: arcane[_arcane].esferaMeso,
    });
  }

  let athentics = _.keys(athentic);
  for (let _athentic of athentics) {
    // console.dir(arcane[_arcane]);
    await Symbol.create({
      type: "Athentic",
      subType: "Cernium",
      level: _athentic,
      requireSymbol: athentic[_athentic].requireAthenticSymbol,
      requireMeso: athentic[_athentic].cerniumMeso,
    });

    await Symbol.create({
      type: "Athentic",
      subType: "Arcus",
      level: _athentic,
      requireSymbol: athentic[_athentic].requireAthenticSymbol,
      requireMeso: athentic[_athentic].arcusMeso,
    });

    await Symbol.create({
      type: "Athentic",
      subType: "Odium",
      level: _athentic,
      requireSymbol: athentic[_athentic].requireAthenticSymbol,
      requireMeso: athentic[_athentic].odiumMeso,
    });

    await Symbol.create({
      type: "Athentic",
      subType: "ShangriLa",
      level: _athentic,
      requireSymbol: athentic[_athentic].requireAthenticSymbol,
      requireMeso: athentic[_athentic].shangriLaMeso,
    });
  }
}

// countOflevel();

module.exports = {
  getSymbolCalc,
};
