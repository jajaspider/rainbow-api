const _ = require("lodash");
const express = require("express");
const router = express.Router();
const maplestoryService1 = require("../../services/maplestory.service.js");

const maplestoryService = require("../../services/maplestory/index");
const { ERROR_CODE, RainbowError } = require("../../core/constants");
const { characterLength } = require("../../services/validation.js");

router.get("/info/:name", characterLength, async function (req, res, next) {
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

router.get("/union/:name", characterLength, async function (req, res, next) {
  try {
    let result = await maplestoryService.info.union(req.params.name);
    return res.json(result);
  } catch (e) {
    console.dir(e);

    if (e instanceof RainbowError) {
      return res.status(e.httpCode).send(`${e.error.message} : ${e.reason}`);
    }
    return res.status(500).send(e.message);
  }
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
    const error = new RainbowError({
      httpCode: 400,
      error: ERROR_CODE.INVALID_PARAMETER,
      reason: "invalid parameter",
    });
    throw error;
  }

  try {
    let calc = await maplestoryService.symbol.getSymbolCalc(
      parseInt(req.params.start),
      parseInt(req.params.end)
    );
    return res.json(calc);
  } catch (e) {
    // console.dir(e);

    if (e instanceof RainbowError) {
      return res.status(e.httpCode).send(`${e.error.message} : ${e.reason}`);
    }
    return res.status(500).send(e.message);
  }
});

router.post("/symbol/growth", async function (req, res, next) {
  let level = _.get(req, "body.level");
  let count = _.get(req, "body.count");
  if (_.isNaN(parseInt(level)) || _.isNaN(parseInt(count))) {
    const error = new RainbowError({
      httpCode: 400,
      error: ERROR_CODE.INVALID_PARAMETER,
      reason: "invalid parameter",
    });
    throw error;
  }

  try {
    let calc = await maplestoryService.symbol.getSymbolGrwoth(level, count);
    return res.json(calc);
  } catch (e) {
    // console.dir(e);

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
      const error = new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.MISSING_PARAMETER,
        reason: "level is required",
      });
      throw error;
    }
    let region = _.get(reqBody, "region", null);
    let continent = _.get(reqBody, "continent", null);

    let subCount = _.get(reqBody, "subCount", 0);

    //  대륙과 지역 동시에 입력
    if (region && continent) {
      const error = new RainbowError({
        httpCode: 204,
        error: ERROR_CODE.DATA_NOT_FOUND,
        reason: "region and continent cannot be entered at the same request",
      });
      throw error;
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
    // console.dir(e);

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
    let region = _.get(reqBody, "region");
    if (!level) {
      const error = new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.MISSING_PARAMETER,
        reason: "level is required",
      });
      throw error;
    }

    if (!region) {
      const error = new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.MISSING_PARAMETER,
        reason: "region is required",
      });
      throw error;
    }

    let raiseUpExp = await maplestoryService.exp.getMonsterPark(level, region);
    return res.json(raiseUpExp);
  } catch (e) {
    console.dir(e);

    if (e instanceof RainbowError) {
      return res.status(e.httpCode).send(`${e.error.message} : ${e.reason}`);
    }
    return res.status(500).send(e.message);
  }
});

router.post("/exp/extrememonsterpark", async function (req, res, next) {
  try {
    let reqBody = req.body;
    let level = _.get(reqBody, "level");
    if (!level) {
      const error = new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.MISSING_PARAMETER,
        reason: "level is required",
      });
      throw error;
    }
    let raiseUpExp = await maplestoryService.exp.getExtremeMonsterPark(level);
    return res.json(raiseUpExp);
  } catch (e) {
    console.dir(e);

    if (e instanceof RainbowError) {
      return res.status(e.httpCode).send(`${e.error.message} : ${e.reason}`);
    }
    return res.status(500).send(e.message);
  }
});

router.post("/util/cooldown", async function (req, res, next) {
  try {
    let reqBody = req.body;
    let cooldown = _.get(reqBody, "cooldown");
    if (!cooldown) {
      const error = new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.MISSING_PARAMETER,
        reason: `cooldown is required`,
      });
      throw error;
    }

    cooldown = _.toNumber(cooldown);
    if (_.isNaN(cooldown) || Math.sign(cooldown) != 1) {
      const error = new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.INVALID_PARAMETER,
        reason: `cooldown must be positive`,
      });
      throw error;
    }

    let mercedes = _.get(reqBody, "mercedes");
    if (!mercedes) {
      const error = new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.MISSING_PARAMETER,
        reason: `mercedes is required`,
      });
      throw error;
    }
    mercedes = _.lowerCase(mercedes);

    let hat = _.get(reqBody, "hat");
    if (!hat) {
      const error = new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.MISSING_PARAMETER,
        reason: `hat is required`,
      });
      throw error;
    }

    hat = _.toNumber(hat);
    if (_.isNaN(hat) || Math.sign(hat) != 1) {
      const error = new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.INVALID_PARAMETER,
        reason: `hat must be positive`,
      });
      throw error;
    }

    let result = maplestoryService.util.cooldown(cooldown, mercedes, hat);
    return res.json(result);
  } catch (e) {
    console.dir(e);

    if (e instanceof RainbowError) {
      return res.status(e.httpCode).send(`${e.error.message} : ${e.reason}`);
    }
    return res.status(500).send(e.message);
  }
});

module.exports = router;
