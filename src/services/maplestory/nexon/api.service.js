const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");
const _ = require("lodash");
const dayjs = require("dayjs");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");

dayjs.extend(utc);
dayjs.extend(timezone);

const DB = require("../../../models"),
  Ocid = DB.Ocid,
  MaplestoryCharacter = DB.MaplestoryCharacter;

const axios = require("../../axios");
const configPath = path.join(process.cwd(), "config", "rainbow.develop.yaml");
const config = yaml.load(fs.readFileSync(configPath));

const { ERROR_CODE, RainbowError } = require("../../../core/constants");
const utils = require("../../../utils");

// ocid 업데이트 및 반환 로직
async function ocidFind(name) {
  try {
    let apiKey = _.get(config, "nexon_api.key");
    let mapleStoryApi = _.get(config, "nexon_api.url");
    mapleStoryApi = `${mapleStoryApi}/maplestory`;

    let characterOcid = await Ocid.findOne({ characterName: name });
    characterOcid = utils.toJSON(characterOcid);

    // ocid가 없다면 새로 등록하도록 사용
    if (_.isEmpty(characterOcid)) {
      let headers = { "x-nxopen-api-key": apiKey };
      let params = {
        character_name: name,
      };
      let reqUrl = `${mapleStoryApi}/v1/id`;

      let result = await axios.get(reqUrl, { headers, params });

      let ocid = _.get(result, "data.ocid");
      await Ocid.create({ ocid, characterName: name });
      return ocid;
    }

    let ocid = _.get(characterOcid, "ocid");
    return ocid;
  } catch (e) {
    // axios 에러이지만 200이 아닌경우
    if (e.response && e.response.status != 200) {
      throw new RainbowError({
        httpCode: e.response.status,
        error: ERROR_CODE.NEXON_API_FAIL,
        reason: `nexon api error`,
      });
    }
  }
}

async function getCharacterInfo(ocid) {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    // yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    // KST
    today.setUTCHours(today.getUTCHours() - 9);
    // 새벽 1시를 기준으로한 데이터 조회
    today.setUTCHours(today.getUTCHours() + 1);
    // console.dir(today);

    let inquiryDate = dayjs()
      .tz("Asia/Seoul")
      .add(-1, "day")
      .format("YYYY-MM-DD");

    let maplestoryCharacter = await MaplestoryCharacter.find({
      ocid,
      createdAt: { $gte: today },
    })
      .sort({
        createdAt: -1,
      })
      .limit(1);
    maplestoryCharacter = utils.toJSON(maplestoryCharacter);

    // 비어있다면 새로 리퀘스트 || 1개의 데이터가 과거 데이터면 새로 리퀘스트
    if (_.isEmpty(maplestoryCharacter)) {
      let characterInfo = { ocid };

      let apiKey = _.get(config, "nexon_api.key");
      let mapleStoryApi = _.get(config, "nexon_api.url");
      mapleStoryApi = `${mapleStoryApi}/maplestory`;

      let headers = { "x-nxopen-api-key": apiKey };
      let params = {
        ocid,
        date: inquiryDate,
      };

      let result = null;

      let basicInfoUrl = `${mapleStoryApi}/v1/character/basic`;
      result = await axios.get(basicInfoUrl, { headers, params });
      // console.dir(_.get(result, "data"));
      characterInfo = _.merge(characterInfo, _.get(result, "data"));

      let popUrl = `${mapleStoryApi}/v1/character/popularity`;
      result = await axios.get(popUrl, { headers, params });
      // console.dir(_.get(result, "data"));
      characterInfo = _.merge(characterInfo, _.get(result, "data"));

      let statUrl = `${mapleStoryApi}/v1/character/stat`;
      result = await axios.get(statUrl, { headers, params });
      // console.dir(_.get(result, "data"));
      characterInfo = _.merge(characterInfo, _.get(result, "data"));

      let dojangUrl = `${mapleStoryApi}/v1/character/dojang`;
      result = await axios.get(dojangUrl, { headers, params });
      // console.dir(_.get(result, "data"));
      characterInfo = _.merge(characterInfo, _.get(result, "data"));

      await MaplestoryCharacter.create(characterInfo);

      return characterInfo;
    }

    return maplestoryCharacter[0];
  } catch (e) {
    console.dir(e);
    // axios 에러이지만 200이 아닌경우
    if (e.response && e.response.status != 200) {
      throw new RainbowError({
        httpCode: e.response.status,
        error: ERROR_CODE.NEXON_API_FAIL,
        reason: `nexon api error`,
      });
    }
  }
}

async function getUnionInfo(ocid) {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    // yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    // KST
    today.setUTCHours(today.getUTCHours() - 9);
    // 새벽 1시를 기준으로한 데이터 조회
    today.setUTCHours(today.getUTCHours() + 1);

    let inquiryDate = dayjs()
      .tz("Asia/Seoul")
      .add(-1, "day")
      .format("YYYY-MM-DD");

    let apiKey = _.get(config, "nexon_api.key");
    let mapleStoryApi = _.get(config, "nexon_api.url");
    mapleStoryApi = `${mapleStoryApi}/maplestory`;

    let headers = { "x-nxopen-api-key": apiKey };
    let params = {
      ocid,
      date: inquiryDate,
    };

    let result = null;

    let unionInfoUrl = `${mapleStoryApi}/v1/ranking/union`;
    result = await axios.get(unionInfoUrl, { headers, params });

    let ranking = _.get(result, "data.ranking");

    return ranking;
  } catch (e) {
    console.dir(e);
    // axios 에러이지만 200이 아닌경우
    if (e.response && e.response.status != 200) {
      throw new RainbowError({
        httpCode: e.response.status,
        error: ERROR_CODE.NEXON_API_FAIL,
        reason: `nexon api error`,
      });
    }
  }
}

module.exports = { ocidFind, getCharacterInfo, getUnionInfo };
