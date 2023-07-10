const _ = require("lodash");
const axios = require("axios");
const cheerio = require("cheerio");

const DB = require("../../models");
const LevelExp = DB.LevelExp;

const utils = require("../../utils");
const { ERROR_CODE, RainbowError } = require("../../core/constants");

async function requestUpate(name) {
  let result = await axios.get(
    `https://maple.gg/u/${encodeURIComponent(name)}`
  );
  if (result.status != 200) {
    return {};
  }
  let html = cheerio.load(result.data);

  let updateDate = html(
    `#user-profile > section > div.row.row-normal > div.col-lg-8 > div.mt-2.text-right.clearfix > div.float-left.font-size-12.text-left > span`
  ).text();
  updateDate = updateDate.replace(/\n/g, "").replace(/ +/g, " ").trim();
  // 오늘 업데이트가 아니라면 업데이트
  if (updateDate != "마지막 업데이트: 오늘") {
    await axios.get(`https://maple.gg/u/${encodeURIComponent(name)}/sync`);
  }

  return;
}

async function character(name) {
  // 일반월드  request
  let result = await axios.get(
    `https://maplestory.nexon.com/Ranking/World/Total?c=${encodeURIComponent(
      name
    )}&w=0`
  );

  // 넥슨 서버문제
  if (result.status != 200) {
    return {};
  }

  let html = cheerio.load(result.data);

  let errorInfo = html(
    `#container > div > div > div:nth-child(4) > div`
  ).text();
  if (errorInfo == "랭킹정보가 없습니다.") {
    //
    result = await axios.get(
      `https://maplestory.nexon.com/Ranking/World/Total?c=${encodeURIComponent(
        name
      )}&w=254`
    );

    html = cheerio.load(result.data);
    let errorInfo = html(
      `#container > div > div > div:nth-child(4) > div`
    ).text();
    if (errorInfo == "랭킹정보가 없습니다.") {
      return {};
    }
  }

  await requestUpate(name);

  let characterRows = html(
    "#container > div > div > div:nth-child(4) > div.rank_table_wrap > table > tbody > tr"
  );

  for (let characterRow of characterRows) {
    if (!_.includes(_.get(characterRow, "attribs.class"), "search_com_chk")) {
      continue;
    }

    let characterTd = cheerio.load(characterRow.children);
    let tds = characterTd("td");
    // console.dir(tds);
    // for (let i = 0; i < tds.length; i += 1) {
    //     console.dir(tds[i].children);
    // }

    let ranking = characterTd("td > p")
      .text()
      .replace(/\n/g, "")
      .replace(/ +/g, " ")
      .trim()
      .split(" ");

    let imgSrc = characterTd("td > span.char_img > img").attr().src;
    let worldSrc = characterTd("td > dl > dt > a > img").attr().src;
    let characterName = characterTd("td > dl > dt > a").text();
    let characterClass = characterTd("td > dl > dd")
      .text()
      .split("/")[1]
      .trim();
    let characterLevel = _.get(tds[2], "children.0.data");
    characterLevel = characterLevel.replace(/[^0-9]/g, "");
    let characterExp = _.get(tds[3], "children.0.data");
    let characterPop = _.get(tds[4], "children.0.data");
    let characterGuild = _.get(tds[5], "children.0.data");

    let levelExp = await LevelExp.findOne({ level: characterLevel });
    levelExp = utils.toJSON(levelExp);

    let needExp = _.get(levelExp, "needExp");
    characterExp = parseInt(characterExp.replace(/[^0-9]/g, ""));
    characterExp = ((characterExp * 100) / needExp).toFixed(3);

    let responseData = null;
    try {
      let response = await axios.get(
        `https://maple.gg/u/${encodeURIComponent(name)}`
      );

      responseData = _.get(response, "data");
    } catch (e) {
      //
    }
    let loadMapleGG = cheerio.load(responseData);
    let dojang = loadMapleGG(
      "#app > div.card.border-bottom-0 > div > section > div.row.text-center > div:nth-child(1) > section > div > div > div"
    )
      .text()
      .replace(/\n/g, "")
      .replace(/ +/g, " ")
      .trim()
      .split(" ");
    let dojangTime = null;
    if (dojang[2] || dojang[3]) {
      dojangTime = `${dojang[2]} ${dojang[3]}`;
    }
    let seed = loadMapleGG(
      "#app > div.card.border-bottom-0 > div > section > div.row.text-center > div:nth-child(2) > section > div > div > div"
    )
      .text()
      .replace(/\n/g, "")
      .replace(/ +/g, " ")
      .trim()
      .split(" ");
    let seedTime = null;
    if (seed[2] || seed[3]) {
      seedTime = `${seed[2]} ${seed[3]}`;
    }

    let character = {
      name: characterName,
      level: characterLevel,
      class: characterClass,
      exp: characterExp,
      pop: characterPop,
      guild: characterGuild,
      worldSrc,
      img: imgSrc,
      ranking: {
        current: ranking[0],
        change: ranking[1],
      },
      dojang: {
        stair: dojang[0] || "-",
        time: dojangTime || "-",
      },
      seed: {
        stair: seed[0] || "-",
        time: seedTime || "-",
      },
    };

    console.dir(character);

    return character;
  }
}

module.exports = {
  character,
};
