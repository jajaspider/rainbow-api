const _ = require("lodash");

const DB = require("../../models");
const QuestExp = DB.QuestExp;
const LevelExp = DB.LevelExp;
const MonsterParkExp = DB.MonsterParkExp;

const utils = require("../../utils");
const { ERROR_CODE, RainbowError } = require("../../core/constants");

async function regionQuest(level, region = null, subQuestCount = 0) {
  let requireExp = await LevelExp.findOne({ level: level });
  requireExp = utils.toJSON(requireExp);
  if (!requireExp) {
    // causeAnError(404, ERROR_CODE.DATA_NOT_FOUND);
    // throw new Error("invaild level");
    throw new RainbowError({
      httpCode: 404,
      error: ERROR_CODE.DATA_NOT_FOUND,
      reason: `invaild level`,
    });
  }

  let query = {};
  if (region) {
    query = {
      region,
      requireLevel: { $lte: level },
    };
  } else {
    query = {
      requireLevel: { $lte: level },
    };
  }

  let questRewards = await QuestExp.find(query);
  questRewards = utils.toJSON(questRewards);
  if (_.isEmpty(questRewards)) {
    throw new RainbowError({
      httpCode: 404,
      error: ERROR_CODE.DATA_NOT_FOUND,
      reason: `invaild region`,
    });
  }

  let raiseExp = 0;
  for (let _reward of questRewards) {
    let questExp = _.get(_reward, "exp");
    let subQuestExp = _.get(_reward, "subExp", 0) * subQuestCount;

    raiseExp += questExp;
    raiseExp += subQuestExp;
  }

  let needExp = _.get(requireExp, "needExp");

  return ((raiseExp * 100) / needExp).toFixed(3);
}

async function continentQuest(level, continent, subQuestCount = 0) {
  let requireExp = await LevelExp.findOne({ level: level });
  requireExp = utils.toJSON(requireExp);
  if (!requireExp) {
    // causeAnError(404, ERROR_CODE.DATA_NOT_FOUND);
    // throw new Error("invaild level");
    throw new RainbowError({
      httpCode: 404,
      error: ERROR_CODE.DATA_NOT_FOUND,
      reason: `invaild level`,
    });
  }

  let questRewards = await QuestExp.find({
    continent: continent,
    requireLevel: { $lte: level },
  });
  questRewards = utils.toJSON(questRewards);
  if (_.isEmpty(questRewards)) {
    throw new RainbowError({
      httpCode: 404,
      error: ERROR_CODE.DATA_NOT_FOUND,
      reason: `invaild continent`,
    });
  }

  let raiseExp = 0;
  for (let _reward of questRewards) {
    let questExp = _.get(_reward, "exp");
    let subQuestExp = _.get(_reward, "subExp", 0) * subQuestCount;

    raiseExp += questExp;
    raiseExp += subQuestExp;
  }

  let needExp = _.get(requireExp, "needExp");

  return ((raiseExp * 100) / needExp).toFixed(3);
}

async function getMonsterPark(level, region) {
  let gatherExp = await MonsterParkExp.findOne({
    region: region,
    extreme: false,
  });
  gatherExp = utils.toJSON(gatherExp);
  if (!gatherExp) {
    throw new RainbowError({
      httpCode: 204,
      error: ERROR_CODE.DATA_NOT_FOUND,
      reason: `invaild region`,
    });
  }

  let requireExp = await LevelExp.findOne({ level: level });
  requireExp = utils.toJSON(requireExp);
  if (!requireExp) {
    throw new RainbowError({
      httpCode: 204,
      error: ERROR_CODE.DATA_NOT_FOUND,
      reason: `invaild level`,
    });
  }

  gatherExp = _.get(gatherExp, "exp");
  let needExp = _.get(requireExp, "needExp");

  return ((gatherExp * 100) / needExp).toFixed(3);
}

async function getExtremeMonsterPark(level) {
  let gatherExp = await MonsterParkExp.findOne({ level: level, extreme: true });
  gatherExp = utils.toJSON(gatherExp);
  if (!gatherExp) {
    // causeAnError(404, ERROR_CODE.DATA_NOT_FOUND);
    // throw new Error("invaild level");
    throw new RainbowError({
      httpCode: 204,
      error: ERROR_CODE.DATA_NOT_FOUND,
      reason: `invaild level`,
    });
  }

  let requireExp = await LevelExp.findOne({ level: level });
  requireExp = utils.toJSON(requireExp);
  if (!requireExp) {
    throw new RainbowError({
      httpCode: 204,
      error: ERROR_CODE.DATA_NOT_FOUND,
      reason: `invaild level`,
    });
  }

  gatherExp = _.get(gatherExp, "exp");
  let needExp = _.get(requireExp, "needExp");

  return ((gatherExp * 100) / needExp).toFixed(3);
}

async function getGrowthPer(type, level) {
  // 익스트림 성장의 비약 - 199레벨 경험치
  // 성장의 비약1 - 209레벨 경험치
  // 성장의 비약2 - 219레벨 경험치
  // 성장의 비약3 - 229레벨 경험치
  // 태풍 성장의 비약 - 239레벨 경험치
  // 극한 성장의 비약 - 249레벨 경험치

  let expValue = 0;
  let maxLevel = 0;
  switch (type) {
    case "leap":
      if (level >= 141 && level < 200) {
        throw new RainbowError({
          httpCode: 400,
          error: ERROR_CODE.UNMEASURABLE,
          reason: `unmeasurable data`,
        });
      }
      if (level < 141) {
        throw new RainbowError({
          httpCode: 400,
          error: ERROR_CODE.INVALID_PARAMETER,
          reason: `invaild level`,
        });
      }
      maxLevel = "199"
      break;
    case "elixir1":
      maxLevel = "209"
      break;
    case "elixir2":
      maxLevel = "219"
      break;
    case "elixir3":
      maxLevel = "229"
      break;
    case "typhoon":
      maxLevel = "239"
      break;
    case "extreme":
      maxLevel = "249"
      break;
    default:
      break;
  }
  if (level < 200) {
    throw new RainbowError({
      httpCode: 400,
      error: ERROR_CODE.INVALID_PARAMETER,
      reason: `invaild level`,
    });
  }

  expValue = await LevelExp.findOne({ level: maxLevel });
  expValue = utils.toJSON(expValue);
  if (!expValue) {
    throw new RainbowError({
      httpCode: 404,
      error: ERROR_CODE.DATA_NOT_FOUND,
      reason: `invaild level`,
    });
  }

  let levelExp = await LevelExp.findOne({ level: level });
  levelExp = utils.toJSON(levelExp);
  if (!levelExp) {
    throw new RainbowError({
      httpCode: 404,
      error: ERROR_CODE.DATA_NOT_FOUND,
      reason: `invaild level`,
    });
  }

  let totalExp = expValue.needExp * 100 / levelExp.needExp;
  
  return totalExp.toFixed(3);
}
// pre execute
async function expOfLevel() {
  let expObj = {};
  let level = 10;
  let requireExp = 1242;
  let accExp = 3347;

  for (let i = level; i <= 300; i += 1) {
    // 10 ~ 15 0%
    if (i < 15) {
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    //15 ~ 30 20%
    else if (15 <= i && i < 30) {
      requireExp = Math.floor((requireExp * 12) / 10);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    //30 ~ 35 0%
    else if (30 <= i && i < 35) {
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    //35 ~ 40 20%
    else if (35 <= i && i < 40) {
      requireExp = Math.floor((requireExp * 12) / 10);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    //40 ~ 60 8%
    else if (40 <= i && i < 60) {
      requireExp = Math.floor((requireExp * 108) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    //60 ~ 65 0%
    else if (60 <= i && i < 65) {
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    //65 ~ 75 7.5%
    else if (65 <= i && i < 75) {
      requireExp = Math.floor((requireExp * 1075) / 1000);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    //75 ~ 90 7%
    else if (75 <= i && i < 90) {
      requireExp = Math.floor((requireExp * 107) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    //90 ~ 100 6.5%
    else if (90 <= i && i < 100) {
      requireExp = Math.floor((requireExp * 1065) / 1000);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    //100 ~ 105 0%
    else if (100 <= i && i < 105) {
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    //105 ~ 140 6.5%
    else if (105 <= i && i < 140) {
      requireExp = Math.floor((requireExp * 1065) / 1000);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    //140 ~ 170 6.5%
    else if (140 <= i && i < 170) {
      requireExp = Math.floor((requireExp * 10625) / 10000);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    //170 ~ 200 5%
    else if (170 <= i && i < 200) {
      requireExp = Math.floor((requireExp * 105) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 200 286.44%
    else if (i == 200) {
      requireExp = Math.ceil((requireExp * 3864413077) / 1000000000);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    //201 ~ 210 12%
    else if (200 < i && i < 210) {
      requireExp = Math.floor((requireExp * 112) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 210 30%
    else if (i == 210) {
      requireExp = Math.floor((requireExp * 130) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 211 ~ 215 11%
    else if (210 < i && i < 215) {
      requireExp = Math.floor((requireExp * 111) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 215 30%
    else if (i == 215) {
      requireExp = Math.floor((requireExp * 130) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 216 ~ 220 9%
    else if (215 < i && i < 220) {
      requireExp = Math.floor((requireExp * 109) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 220 30%
    else if (i == 220) {
      requireExp = Math.floor((requireExp * 130) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 220 ~ 225 7%
    else if (220 < i && i < 225) {
      requireExp = Math.floor((requireExp * 107) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 225 30%
    else if (i == 225) {
      requireExp = Math.floor((requireExp * 130) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 225 ~ 230 7%
    else if (225 < i && i < 230) {
      requireExp = Math.floor((requireExp * 107) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 230 30%
    else if (i == 230) {
      requireExp = Math.floor((requireExp * 130) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 230 ~ 235 3%
    else if (230 < i && i < 235) {
      requireExp = Math.floor((requireExp * 103) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 235 30%
    else if (i == 235) {
      requireExp = Math.floor((requireExp * 130) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 235 ~ 240 3%
    else if (235 < i && i < 240) {
      requireExp = Math.floor((requireExp * 103) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 240 30%
    else if (i == 240) {
      requireExp = Math.floor((requireExp * 130) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 240 ~ 245 3%
    else if (240 < i && i < 245) {
      requireExp = Math.floor((requireExp * 103) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 245 30%
    else if (i == 245) {
      requireExp = Math.floor((requireExp * 130) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 240 ~ 245 3%
    else if (245 < i && i < 250) {
      requireExp = Math.floor((requireExp * 103) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 250 50%
    else if (i == 250) {
      requireExp = Math.floor((requireExp * 150) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 250 ~ 260 3%
    else if (250 < i && i < 260) {
      requireExp = Math.floor((requireExp * 103) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 260 200%
    else if (i == 260) {
      requireExp = Math.floor((requireExp * 300) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 260 ~ 265 1%
    else if (260 < i && i < 265) {
      requireExp = Math.floor((requireExp * 101) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 265 30%
    else if (i == 265) {
      requireExp = Math.floor((requireExp * 130) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 265 ~ 270 1%
    else if (265 < i && i < 270) {
      requireExp = Math.floor((requireExp * 101) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 270 122%
    else if (i == 270) {
      requireExp = Math.floor((requireExp * 222) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 270 ~ 275 1%
    else if (270 < i && i < 275) {
      requireExp = Math.floor((requireExp * 101) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 275 102%
    else if (i == 275) {
      requireExp = Math.floor((requireExp * 202) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 275 ~ 280 10%
    else if (275 < i && i < 280) {
      requireExp = Math.floor((requireExp * 110) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 280 102%
    else if (i == 280) {
      requireExp = Math.floor((requireExp * 202) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 280 ~ 285 10%
    else if (280 < i && i < 285) {
      requireExp = Math.floor((requireExp * 110) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 285 102%
    else if (i == 285) {
      requireExp = Math.floor((requireExp * 202) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 285 ~ 290 10%
    else if (285 < i && i < 290) {
      requireExp = Math.floor((requireExp * 110) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 290 102%
    else if (i == 290) {
      requireExp = Math.floor((requireExp * 202) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 290 ~ 295 10%
    else if (290 < i && i < 295) {
      requireExp = Math.floor((requireExp * 110) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 295 102%
    else if (i == 295) {
      requireExp = Math.floor((requireExp * 202) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 295 ~ 299 10%
    else if (295 < i && i < 299) {
      requireExp = Math.floor((requireExp * 110) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
    // 299 50%
    else if (i == 299) {
      requireExp = Math.floor((requireExp * 150) / 100);
      accExp += requireExp;
      expObj[i] = { requireExp, accExp };
    }
  }

  let levels = _.keys(expObj);
  for (let _level of levels) {
    await LevelExp.create({
      level: _level,
      needExp: expObj[_level].requireExp,
      totalExp: expObj[_level].accExp,
    });
  }
}

// pre execute
async function expOfMonterPark() {
  let monsterParkExp = [];

  //자동 경비 구역
  monsterParkExp.push({
    region: "AutoSecurityArea",
    exp: 3908220,
  });

  //이끼나무 숲
  monsterParkExp.push({
    region: "MossyTreeForest",
    exp: 5989675,
  });

  //하늘 숲 수련장
  monsterParkExp.push({
    region: "SkyForestTrainingCenter",
    exp: 7311630,
  });

  //해적단의 비밀 기지
  monsterParkExp.push({
    region: "SecretPirateHideout",
    exp: 8129820,
  });

  //이계의 전장
  monsterParkExp.push({
    region: "OtherworldBattleground",
    exp: 11524015,
  });

  //외딴 숲 위험 지역
  monsterParkExp.push({
    region: "DangerouslyIsolatedForest",
    exp: 11953470,
  });

  //금지된 시간
  monsterParkExp.push({
    region: "ForbiddenTime",
    exp: 13378390,
  });

  //숨겨진 유적
  monsterParkExp.push({
    region: "ClandestineRuins",
    exp: 15311670,
  });

  //폐허가 된 도시
  monsterParkExp.push({
    region: "RuinedCity",
    exp: 19790735,
  });

  //죽은 나무의 숲
  monsterParkExp.push({
    region: "ForestofDeadTrees",
    exp: 26950030,
  });

  //감시의 탑
  monsterParkExp.push({
    region: "WatchmanTower",
    exp: 27953565,
  });

  //용의 둥지
  monsterParkExp.push({
    region: "DragonNest",
    exp: 33576980,
  });

  //망각의 신전
  monsterParkExp.push({
    region: "TempleofOblivion",
    exp: 35340485,
  });

  //기사단의 요새
  monsterParkExp.push({
    region: "KnightStronghold",
    exp: 39775800,
  });

  //원혼의 협곡
  monsterParkExp.push({
    region: "SpiritValley",
    exp: 40650435,
  });

  //소멸의 여로
  monsterParkExp.push({
    region: "VanishingJourney",
    exp: 179957540,
    needArcane: 30,
  });

  //츄츄 아일랜드
  monsterParkExp.push({
    region: "ChuChu",
    exp: 642539340,
    needArcane: 100,
  });

  //꿈의 도시 레헬른
  monsterParkExp.push({
    region: "Lachelein",
    exp: 1608830495,
    needArcane: 190,
  });

  //신비의 숲 아르카나
  monsterParkExp.push({
    region: "Arcana",
    exp: 2353786685,
    needArcane: 280,
  });

  //기억의 늪 모라스
  monsterParkExp.push({
    region: "Morass",
    exp: 2996755520,
    needArcane: 400,
  });

  //태초의 바다 에스페라
  monsterParkExp.push({
    region: "Esfera",
    exp: 3459833685,
    needArcane: 560,
  });

  //셀라스, 별이 잠긴 곳
  monsterParkExp.push({
    region: "Sellas",
    exp: 4356407460,
    needArcane: 600,
  });

  //문브릿지
  monsterParkExp.push({
    region: "Moonbridge",
    exp: 5858308250,
    needArcane: 670,
  });

  //고통의 미궁
  monsterParkExp.push({
    region: "Labyrinth",
    exp: 7029450500,
    needArcane: 760,
  });

  //리멘
  monsterParkExp.push({
    region: "Limina",
    exp: 7766278700,
    needArcane: 850,
  });

  for (let _monsterPark of monsterParkExp) {
    await MonsterParkExp.create(_monsterPark);
  }

  console.dir("monster park data set");
}

// pre execute
async function expOfExtremeMonsterPark() {
  let monsterParkExp = {};

  let level = 260;
  for (let i = level; i <= 300; i += 1) {
    if (i < 270) {
      monsterParkExp[i] = i * 204000000;
    } else if (270 <= i && i < 275) {
      monsterParkExp[i] = i * 300000000;
    } else if (275 <= i && i < 280) {
      monsterParkExp[i] = i * 384000000;
    } else if (280 <= i && i < 300) {
      monsterParkExp[i] = i * 432000000;
    }
  }

  let levels = _.keys(monsterParkExp);
  for (let _level of levels) {
    await MonsterParkExp.create({
      level: _level,
      exp: monsterParkExp[_level],
      extreme: true,
    });
  }
  console.dir("extreme monster park data set");
}

module.exports = {
  regionQuest,
  getMonsterPark,
  getExtremeMonsterPark,
  continentQuest,
  getGrowthPer,
};
