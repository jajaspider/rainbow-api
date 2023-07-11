const _ = require("lodash");
const axios = require("axios");
const cheerio = require("cheerio");

const exp = require("../core/exp");
const symbol = require("../core/symbol");
const MapleClass = require("../models").MapleClass;
const util = require("../utils");

async function getStarForce(level, star) {
  let itemTable = {};

  // let i;
  let arr = ["130", "140", "150", "160", "200"];
  for (i = 0; i < arr.length; i += 1) {
    itemTable[arr[i]] = {};
  }

  for (let i = 0; i < arr.length; i += 1) {
    for (let j = 0; j < 25; j += 1) {
      let stat = 0;
      let attack = 0;
      for (let k = 0; k <= j; k++) {
        if (0 < k && k <= 5) {
          stat += 2;
        } else if (5 < k && k <= 15) {
          stat += 3;
        }
      }

      let attackStar = j - 15;
      for (let k = 0; k < attackStar; k++) {
        // item-> 160 > 3
        // 0 attack 10
        if (k < 6) {
          attack += 7 + i + k;
          stat += 7 + 2 * i;
        }
        if (k === 6) {
          attack += 7 + i + k + 1;
          stat += 7 + 2 * i;
        }
      }
      let attackStar2 = j - 22;
      if (22 <= j) {
        for (let k = 0; k < attackStar2; k++) {
          attack += 16 + i + k * 2;
        }
      }

      if (i == 4 && 0 < attackStar) {
        attack += attackStar;
      }

      itemTable[arr[i]][j] = {
        stat,
        attack,
      };

      // itemTable[arr[i]] = {
      //     j: {
      //         stat,
      //         attack
      //     }
      // };
    }
  }

  return (
    _.get(itemTable, `${level}.${star}`) || {
      errorInfo: "잘못입력하셨습니다.",
    }
  );
}

function getGrowthPer(type, level) {
  // 익스트림 성장의 비약 - 199레벨 경험치
  // 성장의 비약1 - 209레벨 경험치
  // 성장의 비약2 - 219레벨 경험치
  // 성장의 비약3 - 229레벨 경험치
  // 태풍 성장의 비약 - 239레벨 경험치
  // 극한 성장의 비약 - 249레벨 경험치

  let expValue = 0;
  switch (type) {
    case "leap":
      if (level >= 140 && level < 200) {
        return "측정할 수 없습니다.";
      }
      if (level < 140) {
        return "사용이 불가능합니다.";
      }
      expValue = exp.character[199];
      break;
    case "elixir1":
      expValue = exp.character[209];
      break;
    case "elixir2":
      expValue = exp.character[219];
      break;
    case "elixir3":
      expValue = exp.character[229];
      break;
    case "typhoon":
      expValue = exp.character[239];
      break;
    case "extreme":
      expValue = exp.character[249];
      break;
    default:
      break;
  }
  if (level < 200) {
    return "사용이 불가능합니다.";
  }

  const expPercent = exp.getPercent(parseInt(level), expValue);
  return parseFloat(expPercent) >= 100 ? "1레벨 상승" : expPercent;
}

async function getClass(type) {
  if (!type) {
    let classes = await MapleClass.find();
    classes = util.toJSON(classes);
    let randomOne = _.sample(classes);

    return _.get(randomOne, "className");
  }

  let allowStat = [
    "str",
    "dex",
    "int",
    "luk",
    "hp",
    "힘",
    "덱스",
    "인트",
    "럭",
  ];
  let allowGroup = [
    "모험가",
    "시그너스",
    "레지스탕스",
    "영웅",
    "노바",
    "레프",
    "아니마",
    "제로",
    "키네시스",
  ];
  let aloowType = ["전사", "마법사", "궁수", "도적", "해적"];
  let query = {};
  if (_.includes(allowStat, type)) {
    if (type == "힘") {
      type = "str";
    } else if (type == "덱스") {
      type = "dex";
    } else if (type == "인트") {
      type = "int";
    } else if (type == "럭") {
      type = "luk";
    } else if (type == "체력") {
      type = "hp";
    }

    query = {
      classStat: type,
    };
  } else if (_.includes(allowGroup, type)) {
    query = {
      classGroup: type,
    };
  } else if (_.includes(aloowType, type)) {
    query = {
      classType: type,
    };
  }

  let classes = await MapleClass.find(query);
  classes = util.toJSON(classes);
  let randomOne = _.sample(classes);

  return _.get(randomOne, "className");
}

async function getEventList() {
  const entPoint = "https://maplestory.nexon.com";
  const url = `${entPoint}/News/Event/Ongoing`;
  let response = await axios.get(url);
  let responseData = _.get(response, "data");

  let eventPage = cheerio.load(responseData);
  let eventList = eventPage(
    `#container > div > div.contents_wrap > div.event_board > ul > li`
  );

  let events = [];
  for (let _event of eventList) {
    let eventHtml = cheerio.load(_event);

    let imgSrc = eventHtml(`div > dl > dt > a > img`);
    imgSrc = _.get(imgSrc, "0.attribs.src");

    let targetNode = eventHtml(`div > dl > dd.data > p > a`);

    let href = _.get(targetNode, "0.attribs.href");
    let title = _.get(targetNode, "0.children.0.data");

    let dateNode = eventHtml(`div > dl > dd.date > p`).text();

    events.push({
      title: title,
      img_path: imgSrc,
      link: `${href}`,
      date: dateNode,
    });
  }
  return events;
}

// function getSymbol(start, end) {

//     symbol.getCal(start, end);
// }
function getSymbol(start, end) {
  start = parseInt(start);
  end = parseInt(end);
  if (start < 1 || 19 < start) {
    // error processing
    return {
      errorInfo: "시작값이 잘못되었습니다.",
    };
  }
  if (end <= start || 20 < end) {
    // error processing
    return {
      errorInfo: "종료값이 잘못되었습니다.",
    };
  }
  let result = symbol.getFigure(start, end);
  return result;
}

module.exports = {
  getStarForce,
  getGrowthPer,
  getClass,
  getEventList,
  getSymbol,
};
