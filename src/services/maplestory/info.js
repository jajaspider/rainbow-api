const _ = require("lodash");

const { ERROR_CODE, RainbowError } = require("../../core/constants");

const nexonApiService = require("./nexon/api.service");

async function character(name) {
  let ocid = await nexonApiService.ocidFind(name);
  let characterInfo = await nexonApiService.getCharacterInfo(ocid);
  return characterInfo;
}

async function union(name) {
  let ocid = await nexonApiService.ocidFind(name);
  let ranking = await nexonApiService.getUnionInfo(ocid);
  return ranking;
}

module.exports = {
  character,
  union,
};
