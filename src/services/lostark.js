const _ = require("lodash");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const DB = require("../models"),
  Character = DB.LostarkCharacter;

let configPath = path.join(process.cwd(), "config", "rainbow.develop.yaml");
let config = yaml.load(fs.readFileSync(configPath));

const urlEndpoint = "https://developer-lostark.game.onstove.com";

async function getInfo(name) {
  // 2022. 02. 02
  // 캐릭터 데이터를 뽑아오기전에 마지막으로 업데이트한시간을 찾아서 5분내면 db데이터를 return 그게아니라면 업데이트
  // let existCharacter = await Character.findOne({ name: name }).sort({ createdAt: -1 });
  // existCharacter = JSON.parse(JSON.stringify(existCharacter));
  // // 이미 캐릭터가 있다면
  // if (existCharacter) {
  //     let prevDate = new Date(_.get(existCharacter, 'createdAt'));
  //     let currDate = new Date();

  //     //차이나는 시간을 계산해서
  //     let mins = Number.parseFloat((currDate - prevDate) / 1000 / 60);
  //     //5분이하라면 기존 데이터 리턴
  //     if (mins <= 5.0) {
  //         return _.get(existCharacter, 'character');
  //     }
  // }

  let result = await axios.get(
    `https://lostark.game.onstove.com/Profile/Character/${encodeURIComponent(
      name
    )}`
  );
  if (result.status != 200) {
    return {};
  }

  let html = cheerio.load(result.data);

  let errorInfo = html(
    "#lostark-wrapper > div > main > div > div.profile-ingame > div > span:nth-child(1)"
  ).text();
  if (errorInfo) {
    return {
      errorInfo,
    };
  }

  let server = html(
    "#lostark-wrapper > div > main > div > div.profile-character-info > span.profile-character-info__server"
  ).text();
  server = server.replace("@", "");
  let nickname = html(
    "#lostark-wrapper > div > main > div > div.profile-character-info > span.profile-character-info__name"
  ).text();
  let job = html(
    "#lostark-wrapper > div > main > div > div.profile-character-info > img"
  );
  job = _.get(job, "0.attribs.alt");
  let characterImage = html(
    `#profile-equipment > div.profile-equipment__character > img`
  );
  characterImage = _.get(characterImage, "0.attribs.src");
  let expeditionLevel = html(
    "#lostark-wrapper > div > main > div > div.profile-ingame > div.profile-info > div.level-info > div.level-info__expedition > span:nth-child(2)"
  ).text();
  let fightLevel = html(
    "#lostark-wrapper > div > main > div > div.profile-ingame > div.profile-info > div.level-info > div.level-info__item > span:nth-child(2)"
  ).text();
  let itemLevel = html(
    "#lostark-wrapper > div > main > div > div.profile-ingame > div.profile-info > div.level-info2 > div.level-info2__expedition > span:nth-child(2)"
  ).text();
  let attack = html(
    "#profile-ability > div.profile-ability-basic > ul > li:nth-child(1) > span:nth-child(2)"
  ).text();
  let health = html(
    "#profile-ability > div.profile-ability-basic > ul > li:nth-child(2) > span:nth-child(2)"
  ).text();
  let title = html(
    "#lostark-wrapper > div > main > div > div.profile-ingame > div.profile-info > div.game-info > div.game-info__title > span:nth-child(2)"
  ).text();
  let pvp = html(
    "#lostark-wrapper > div > main > div > div.profile-ingame > div.profile-info > div.game-info > div.level-info__pvp > span:nth-child(2)"
  ).text();
  let skillDatas = html(
    "#profile-skill > div.profile-skill-battle > div.profile-skill__list > div > a"
  );
  let skill = [];
  for (let skillData of skillDatas) {
    if (_.get(skillData, "attribs.class") == "button button--profile-skill") {
      let skillObj = JSON.parse(_.get(skillData, "attribs.data-skill"));

      let tripod = [];
      for (let i = 0; i < skillObj.selectedTripodTier.length; i += 1) {
        let result = _.find(skillObj.tripodList, {
          level: i,
          slot: skillObj.selectedTripodTier[i],
        });
        if (result) {
          tripod.push(result);
        }
      }

      skill.push({
        name: skillObj.name,
        level: skillObj.level,
        slotIcon: skillObj.slotIcon,
        tripod,
      });
    }
  }

  let jewels = [];
  let noJewel = html(
    `#profile-jewel > div > div.jewel-effect__list > div > span.no_jewel`
  );
  noJewel = _.get(noJewel, "0.attribs.class");
  // 보석이 있을때만
  if (!noJewel) {
    let jewelHtml = html(`#profile-jewel > div > div.jewel__wrap > span`);
    for (let _jewel of jewelHtml) {
      // 쥬얼이 배열이 안되어있기때문에 gemId로 정보 매칭
      let gemId = _.get(_jewel, "attribs.id");

      // img는 보석의 멸화/홍염을 구분하기위함
      // level은 text로 기억
      let jewelHtml = cheerio.load(_jewel);
      let jewelevel = jewelHtml(`span.jewel_level`);
      let jewelImg = jewelHtml(`span.jewel_img`);

      jewelImg = _.get(jewelImg, "0.children.0.attribs.src");
      // 11_10은 이벤트 보석임
      let annihilations = [
        "46",
        "47",
        "48",
        "49",
        "50",
        "51",
        "52",
        "53",
        "54",
        "55",
        "11_10",
      ];
      for (let i = 0; i < annihilations.length; i += 1) {
        if (_.includes(jewelImg, annihilations[i])) {
          jewels.push({
            level: _.get(jewelevel, "0.children.0.data"),
            type: "annihilation",
            gemId,
          });
        }
      }

      // 11_11은 이벤트 보석임
      let cooldowns = [
        "56",
        "57",
        "58",
        "59",
        "60",
        "61",
        "62",
        "63",
        "64",
        "65",
        "11_11",
      ];
      for (let i = 0; i < cooldowns.length; i += 1) {
        if (_.includes(jewelImg, cooldowns[i])) {
          jewels.push({
            level: _.get(jewelevel, "0.children.0.data"),
            type: "cooldown",
            gemId,
          });
        }
      }
    }

    //jewels를 높은 레벨과 레벨 별 멸화/홍염으로 정리
    jewels = _.reverse(_.sortBy(jewels, ["level", "type"]));

    try {
      //보석의 스킬 상세 정보를 획득 하기위함
      let jewelDetails = html(
        "#profile-jewel > div > div.jewel-effect__list > div > ul > li"
      );
      // console.dir(jewelDetails);
      for (let _jewelDetail of jewelDetails) {
        //해당 slot의 보석 데이터를 획득
        let jewelDetailHtml = cheerio.load(_jewelDetail);
        let jewelSlot = jewelDetailHtml(`span.slot`);
        let skillName = jewelDetailHtml(`strong.skill_tit`);
        //gemId로 데이터 매칭
        let gemId = _.get(jewelSlot, "0.attribs.data-gemkey");

        //실제 스킬 정보를 획득
        let jewelInfo = jewelDetailHtml("p.skill_detail");

        let jewelObj = _.find(jewels, { gemId });
        jewelObj.info = jewelInfo.text();
        jewelObj.name = skillName.text();
      }
    } catch (e) {
      // 3티어 이상의 보석을 추출하지않으면, 기존의 jewels에 데이터가 없어서 처리되지않음
      // 그래서 error를 무시함
    }
  }

  // If use the getCollection post method, obtain information from the document.
  let lines = _.split(result.data, "\n");
  let characterUnique = {};
  for (let line of lines) {
    if (_.includes(line, "_memberNo")) {
      line = line.replace("\t\tvar _memberNo = '", "").replace("';\r", "");
      characterUnique.memberNo = line;
    }
    if (_.includes(line, "_worldNo")) {
      line = line.replace("\t\tvar _worldNo = '", "").replace("';\r", "");
      characterUnique.worldNo = line;
    }
    if (_.includes(line, "_pcId")) {
      line = line.replace("\t\tvar _pcId = '", "").replace("';\r", "");
      characterUnique.pcId = line;
    }
  }

  let collectionList = [];

  let collectionRes = await axios.post(
    "https://lostark.game.onstove.com/Profile/GetCollection",
    characterUnique
  );
  let collectionHtml = cheerio.load(collectionRes.data);
  let collections = collectionHtml(`div > div.lui-tab__menu > a`);

  for (let _collection of collections) {
    collectionList.push({
      name: _.get(_collection, "children.0.data").trim(),
      count: _.get(_collection, "children.1.children.0.data"),
    });
  }

  let specifics = html(
    "#profile-ability > div.profile-ability-battle > ul > li > span"
  );
  let specificList = [];
  for (let i = 0; i < specifics.length; i += 2) {
    let specificName = _.get(specifics[i], "children.0.data");
    let specificValue = _.get(specifics[i + 1], "children.0.data");

    specificList.push({
      specificName,
      specificValue,
    });
  }

  let guildName = html(
    "#lostark-wrapper > div > main > div > div.profile-ingame > div.profile-info > div.game-info > div.game-info__guild > span:nth-child(2)"
  ).text();

  let engraveList = [];
  let engraves = html(
    "#profile-ability > div.profile-ability-engrave > div > div.swiper-wrapper > ul > li > span"
  );
  for (let engrave of engraves) {
    engraveList.push(_.get(engrave, "children.0.data"));
  }

  let cardList = [];
  let cards = html("#cardSetList > li > div");
  for (let i = 0; i < cards.length; i += 2) {
    let cardSet = _.get(cards[i], "children.0.data");
    let cardSetValue = _.get(cards[i + 1], "children.0.data");

    cardList.push({
      cardSet,
      cardSetValue,
    });
  }

  let script = html(`#profile-ability > script`);
  // console.dir(script);
  script = _.get(script, "0.children.0.data");
  // console.dir(script);
  script = script.replace(`$.Profile = `, "");
  script = script.replace(`;`, "");
  script = JSON.parse(script);
  // console.dir(script);
  let equip = _.get(script, "Equip");
  // console.dir(equip);

  let equipment = html(
    `#profile-equipment > div.profile-equipment__slot > div`
  );

  const ITEM_ELEMENT_TYPE = {
    NAME_TAG_BOX: "NameTagBox",
    ITEM_TITLE: "ItemTitle",
    ITEM_PART: "ItemPartBox",
    INDENT_STRING: "IndentStringGroup",
  };
  let equipmentList = [];

  for (let i = 0; i < equipment.length; i += 1) {
    let dataItem = _.get(equipment[i], "attribs.data-item");
    let equipObj = { dataItem: dataItem };

    let targetItem = _.get(equip, dataItem);
    // let itemName = _.get(targetItem, 'Element_000.value');
    // let itemName = _.get(targetItem, 'Element_000.value');
    let count = 0;
    while (true) {
      let elementCount = count.toString().padStart(3, "0");
      console.dir(`Element_${elementCount}`);
      let targetElement = _.get(targetItem, `Element_${elementCount}`);
      if (!targetElement) {
        break;
      }
      console.dir(targetElement);

      let type = _.get(targetElement, "type");

      if (type == ITEM_ELEMENT_TYPE.NAME_TAG_BOX) {
        equipObj.itemName = _.get(targetElement, "value").replace(
          /<[^>]*>?/g,
          ""
        );
      } else if (type == ITEM_ELEMENT_TYPE.ITEM_TITLE) {
        equipObj.level = _.get(targetElement, "value.leftStr2").replace(
          /<[^>]*>?/g,
          ""
        );
        equipObj.quality = _.get(targetElement, "value.qualityValue");
        equipObj.itemIcon = _.get(
          targetElement,
          "value.slotData.iconPath"
        ).replace(/<[^>]*>?/g, "");
      } else if (type == ITEM_ELEMENT_TYPE.ITEM_PART) {
        equipObj[
          `${_.get(targetElement, "value.Element_000").replace(
            /<[^>]*>?/g,
            ""
          )}`
        ] = _.get(targetElement, "value.Element_001").replace(/<[^>]*>?/g, "");
      } else if (type == ITEM_ELEMENT_TYPE.INDENT_STRING) {
        // console.dir(_.get(targetElement, 'value.Element_000.contentStr'));
        equipObj.temp = _.get(targetElement, "value.Element_000.contentStr");
      }

      // console.dir(equipObj);
      count += 1;
    }

    equipmentList.push(equipObj);
  }

  console.dir(equipmentList, { depth: null });

  let character = {
    server,
    nickname,
    job,
    fightLevel,
    itemLevel,
    characterImage,
    attack,
    health,
    specificList,
    guildName,
    engraveList,
    cardList,
    expeditionLevel,
    title,
    pvp,
    skill,
    jewel: jewels,
    collection: collectionList,
  };

  await Character.create({
    name: nickname,
    character,
  });

  return character;
}

async function getCrystal() {
  // 2022. 01. 31
  // 웹 접근 전 기존 크리스탈을 업데이트했던 시간을 디비에서 확인후, 최소 5분이상이 지나야 새로운 데이터를 불러와서 넣어주는 형태로 변경 해야함.

  let result = await axios.get("https://loatool.taeu.kr/lospi");
  if (result.status != 200) {
    return {
      errorInfo: "접근 실패",
    };
  }

  let html = cheerio.load(result.data);

  let regex = /[^0-9]/g;
  let buyPrice = html(
    "#app > div > main > div > div > div > div > div.d-flex.flex-row.justify-center > div > div > div:nth-child(1) > div > div > div.v-card__text.text-center > div:nth-child(2) > div:nth-child(1) > span"
  ).text();
  buyPrice = buyPrice.replace(regex, "");
  let sellPrice = html(
    "#app > div > main > div > div > div > div > div.d-flex.flex-row.justify-center > div > div > div:nth-child(1) > div > div > div.v-card__text.text-center > div:nth-child(2) > div:nth-child(2) > span"
  ).text();
  sellPrice = sellPrice.replace(regex, "");

  return {
    buyPrice,
    sellPrice,
  };
}

async function getExpandCharacter(name) {
  let result = await axios.get(
    `https://lostark.game.onstove.com/Profile/Character/${encodeURIComponent(
      name
    )}`
  );
  if (result.status != 200) {
    return {
      errorInfo: "접근 실패",
    };
  }

  let html = cheerio.load(result.data);

  let serverList = html("#expand-character-list > strong");
  let expandCharacter = [];

  for (let i = 0; i < serverList.length; i += 1) {
    let server = _.get(serverList[i], "children.0.data");
    server = server.replace("@", "");

    let characterList = [];
    let characters = html(
      `#expand-character-list > ul:nth-child(${
        3 + i * 2
      }) > li > span > button > span`
    );

    for (let character of characters) {
      let _characterInfo = await getInfo(_.get(character, "children.0.data"));
      // let _characterInfo = await axios.get(`http://127.0.0.1:30003/v0/lostark/info/${}`);

      let itemLevelStr = _.get(_characterInfo, "itemLevel");
      itemLevelStr = itemLevelStr.replace("Lv.", "");
      let numberRegex = /[^0-9.]/g;
      let itemLevel = Number.parseFloat(itemLevelStr.replace(numberRegex, ""));

      let job = _.get(_characterInfo, "job");

      characterList.push({
        name: _.get(character, "children.0.data"),
        itemLevel,
        itemLevelStr,
        job,
      });
    }
    characterList = _.sortBy(characterList, "itemLevel").reverse();

    expandCharacter.push({
      server,
      characterList,
    });
  }

  return expandCharacter;
}

async function getEventList() {
  const entPoint = "https://lostark.game.onstove.com/";
  const url = `${entPoint}/News/Event/Now`;
  let response = await axios.get(url);
  let responseData = _.get(response, "data");

  let eventPage = cheerio.load(responseData);
  let eventList = eventPage(
    `#lostark-wrapper > div > main > div > div > div.list.list--event > ul > li`
  );

  let events = [];
  for (let _event of eventList) {
    let eventHtml = cheerio.load(_event);

    let hrefHtml = eventHtml(`a`);
    let href = _.get(hrefHtml, "0.attribs.href");

    let imgSrc = eventHtml(`a > div.list__thumb > img`);
    imgSrc = _.get(imgSrc, "0.attribs.src");

    let titleHtml = eventHtml(`a > div.list__subject > span`);
    let title = _.get(titleHtml, "0.children.0.data");

    let term = eventHtml(`a > div.list__term`).text();

    let receive = eventHtml(`a > div.list__receive`).text();

    // let imgSrc = eventHtml(`div > dl > dt > a > img`);
    // imgSrc = _.get(imgSrc, '0.attribs.src');

    // let targetNode = eventHtml(`div > dl > dd.data > p > a`);

    // let href = _.get(targetNode, '0.attribs.href');
    // let title = _.get(targetNode, '0.children.0.data');

    // let dateNode = eventHtml(`div > dl > dd.date > p`).text();

    events.push({
      title: title,
      img_path: imgSrc,
      link: `${href}`,
      term: term,
      receive: receive,
    });
  }
  return events;
}

function getDistributeAmount(gold, person = 0) {
  let result = {};
  /*
    4인기준 판매금액입력(300)
    실 수령금 = 판매금액 *0.95(285)
    1인당 분배금액 = 실 수령금/400(71.25)
    적정입찰가 = 실수령금-1인당 분배금액 인가(213)
    최적입찰가 = 적정 입찰가 /1.1 (193.6363)
    */
  gold = Number.parseInt(gold);
  let excludeFeeGold = Math.floor(gold * 0.95);

  function calculator(people) {
    // 분배금
    let individualGold = Math.floor(excludeFeeGold / people);
    // 분배금을 위한 경매 입찰가
    let bidPrice = individualGold * (people - 1);

    // 분배금을 유지하면서 나는 최대로 이익을 보는 가격
    let bestBid = Math.ceil((excludeFeeGold - individualGold) / 1.1) + 1;
    // let bestBid = Math.ceil(bidPrice / 1.1) + 1;

    return {
      individualGold,
      bidPrice,
      bestBid,
    };
  }

  result["gold"] = gold;
  result["excludeFee"] = excludeFeeGold;

  let fourResult = calculator(4);
  let eightResult = calculator(8);

  result["4"] = fourResult;
  result["8"] = eightResult;
  if (person > 0) {
    let customResult = calculator(person);
    result["custom"] = customResult;
  }

  return result;
}

async function marketSearching(categoryName, itemName) {
  let categoryFiltering = [
    { Code: 10100, CodeName: "장비상자" },

    { Code: 20000, CodeName: "아바타" },

    { Code: 20005, CodeName: "무기" },
    { Code: 20010, CodeName: "머리" },
    { Code: 20020, CodeName: "얼굴1" },
    { Code: 20030, CodeName: "얼굴2" },
    { Code: 20050, CodeName: "상의" },
    { Code: 20060, CodeName: "하의" },
    { Code: 20070, CodeName: "상하의세트" },
    { Code: 21400, CodeName: "악기" },
    { Code: 21500, CodeName: "아바타상자" },

    { Code: 40000, CodeName: "각인서" },

    { Code: 50000, CodeName: "강화재료" },

    { Code: 50010, CodeName: "재련재료" },
    { Code: 50020, CodeName: "재련추가재료" },
    { Code: 51000, CodeName: "기타재료" },
    { Code: 51100, CodeName: "무기진화재료" },

    { Code: 60000, CodeName: "전투용품" },

    { Code: 60200, CodeName: "회복형" },
    { Code: 60300, CodeName: "공격형" },
    { Code: 60400, CodeName: "기능성" },
    { Code: 60500, CodeName: "버프형" },

    { Code: 70000, CodeName: "요리" },

    { Code: 90000, CodeName: "생활" },

    { Code: 90200, CodeName: "식물채집" },
    { Code: 90300, CodeName: "벌목" },
    { Code: 90400, CodeName: "채광" },
    { Code: 90500, CodeName: "수렵" },
    { Code: 90600, CodeName: "낚시" },
    { Code: 90700, CodeName: "고고학" },
    { Code: 90800, CodeName: "기타" },

    { Code: 100000, CodeName: "모험의서" },

    { Code: 110000, CodeName: "항해" },

    { Code: 110100, CodeName: "선박재료" },
    { Code: 110110, CodeName: "선박스킨" },
    { Code: 111900, CodeName: "선박재료상자" },

    { Code: 140000, CodeName: "펫" },

    // { Code: 140100, CodeName: "펫" },
    { Code: 140200, CodeName: "펫상자" },

    { Code: 160000, CodeName: "탈것" },

    // { Code: 160100, CodeName: "탈것" },
    { Code: 160200, CodeName: "탈것상자" },

    { Code: 170000, CodeName: "기타" },

    { Code: 220000, CodeName: "보석상자" },
  ];

  let category = _.find(categoryFiltering, { CodeName: categoryName });
  if (!category) {
    const error = new Error({
      code: 400,
      message: "No matching categories",
    });
    throw error;
  }

  let url = `${urlEndpoint}/markets/items`;
  console.dir({ category, itemName });

  let result = await axios.post(
    url,
    { CategoryCode: category.Code, ItemName: itemName },
    {
      headers: {
        Authorization: `Bearer ${_.get(config, "lostark_api_key")}`,
      },
    }
  );

  if (result.status != 200) {
    const error = new Error({
      code: 500,
      message: "Call Admin!!",
    });
    throw error;
  }

  // 페이지네이션의 의미가없을듯
  if (_.get(result.data, "TotalCount") >= 10) {
    const error = new Error({
      code: 400,
      message: "Search in more detail",
    });
    throw error;
  }

  if (_.get(result.data, "TotalCount") == 0) {
    const error = new Error({
      code: 400,
      message: "There are no items you are looking for",
    });
    throw error;
  }

  let resultList = [];
  console.dir(result.data);

  let items = _.get(result.data, "Items");
  for (let _item of items) {
    let name = _.get(_item, "Name");
    let grade = _.get(_item, "Grade");
    let currentMinPrice = _.get(_item, "CurrentMinPrice");

    let itemObj = {
      name,
      grade,
      currentMinPrice,
    };

    resultList.push(itemObj);
  }

  return resultList;
}

module.exports = {
  getInfo,
  getCrystal,
  getExpandCharacter,
  getEventList,
  getDistributeAmount,
  marketSearching,
};
