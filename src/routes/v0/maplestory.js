const _ = require("lodash");
const express = require("express");
const router = express.Router();
const maplestoryService1 = require("../../services/maplestory.service.js");

const maplestoryService = require("../../services/maplestory/index");
const { ERROR_CODE, RainbowError } = require("../../core/constants");

router.get("/info/:name", async function (req, res, next) {
  try {
    let result = await maplestoryService.info.character(req.params.name);
    return res.json(result);
  } catch (e) {
    console.dir(e);

    if (e instanceof RainbowError) {
      return res.status(e.httpCode).send(`${e.error.message} : ${e.reason}`);
    }
    return res.status(500).send(e.message);
  }
});

router.get("/starforce/:level/:star", async function (req, res, next) {
  let resPayload = {
    isSuccess: false,
  };

  let result = await maplestoryService1.getStarForce(
    req.params.level,
    req.params.star
  );
  if (_.get(result, "errorInfo")) {
    resPayload.isSuccess = false;
    resPayload.payload = {
      message: _.get(result, "errorInfo"),
    };
    return res.json(resPayload);
  }

  resPayload.isSuccess = true;
  resPayload.payload = {
    starforce: result,
  };
  return res.json(resPayload);
});

router.get("/growth/:level", async function (req, res, next) {
  let resPayload = {
    isSuccess: false,
  };

  if (!_.get(req.body, "type")) {
    resPayload.isSuccess = false;
    resPayload.payload = {
      message: "type을 확인하세요",
    };
    return res.json(resPayload);
  }

  let result = maplestoryService1.getGrowthPer(req.body.type, req.params.level);

  resPayload.isSuccess = true;
  resPayload.payload = {
    percent: result,
  };
  return res.json(resPayload);
});

router.get("/union/:name", async function (req, res, next) {
  let resPayload = {
    isSuccess: false,
  };

  let result = await maplestoryService1.getUnionInfo(req.params.name);
  if (_.get(result, "errorInfo")) {
    resPayload.isSuccess = false;
    resPayload.payload = {
      message: _.get(result, "errorInfo"),
    };
    return res.json(resPayload);
  }

  resPayload.isSuccess = true;
  resPayload.payload = {
    character: result,
  };
  return res.json(resPayload);
});

router.get("/event", async function (req, res, next) {
  let resPayload = {
    isSuccess: false,
  };

  let result = await maplestoryService1.getEventList();

  resPayload.isSuccess = true;
  resPayload.payload = {
    events: result,
  };
  return res.json(resPayload);
});

router.get("/symbol/:start/:end", async function (req, res, next) {
  if (
    _.isNaN(parseInt(req.params.start)) ||
    _.isNaN(parseInt(req.params.end))
  ) {
    return res.status(400).send({
      error: ERROR_CODE.INVALID_PARAMETER,
      reason: `invalid parameter`,
    });
  }

  try {
    let calc = await maplestoryService.symbol.getSymbolCalc(
      parseInt(req.params.start),
      parseInt(req.params.end)
    );
    return res.json(calc);
  } catch (e) {
    console.dir(e);

    if (e instanceof RainbowError) {
      return res.status(e.httpCode).send(`${e.error.message} : ${e.reason}`);
    }
    return res.status(500).send(e.message);
  }
});

router.post("/exp/quest", async function (req, res, next) {
  try {
    let reqBody = req.body;
    let level = _.get(reqBody, "level");
    if (!level) {
      return res.status(400).send({
        error: ERROR_CODE.MISSING_PARAMETER,
        reason: `level is required`,
      });
    }
    let region = _.get(reqBody, "region", null);
    let continent = _.get(reqBody, "continent", null);

    let subCount = _.get(reqBody, "subCount", 0);

    //  대륙과 지역 동시에 입력
    if (region && continent) {
      return res.status(204).send({
        error: ERROR_CODE.DATA_NOT_FOUND,
        reason: `region and continent cannot be entered at the same request`,
      });
    }
    // 대륙만 입력
    else if (continent) {
      let raiseUpExp = await maplestoryService.exp.continentQuest(
        level,
        continent,
        subCount
      );
      return res.json(raiseUpExp);
    }
    // 지역이 입력되었거나, 입력이 안되어있을수도있음
    else {
      let raiseUpExp = await maplestoryService.exp.regionQuest(
        level,
        region,
        subCount
      );
      return res.json(raiseUpExp);
    }
  } catch (e) {
    console.dir(e);

    if (e instanceof RainbowError) {
      return res.status(e.httpCode).send(`${e.error.message} : ${e.reason}`);
    }
    return res.status(500).send(e.message);
  }
});

router.post("/exp/monsterpark", async function (req, res, next) {
  try {
    let reqBody = req.body;
    let level = _.get(reqBody, "level");
    if (!level) {
      return res.status(400).send({
        error: ERROR_CODE.MISSING_PARAMETER,
        reason: `level is required`,
      });
    }

    let raiseUpExp = await maplestoryService.exp.getMonsterPark(level);
    return res.json(raiseUpExp);
  } catch (e) {
    console.dir(e);

    if (e instanceof RainbowError) {
      return res.status(e.httpCode).send(`${e.error.message} : ${e.reason}`);
    }
    return res.status(500).send(e.message);
  }
});

module.exports = router;
