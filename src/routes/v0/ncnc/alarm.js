const express = require("express");
const router = express.Router();
const _ = require("lodash");
const DB = require("../../../models"),
  Alarm = DB.NCNCAlarm;

router.get("/get", async (req, res, next) => {
  try {
    let alram = await Alarm.find({});
    return res.json(alram);
  } catch (e) {
    if (e instanceof RainbowError) {
      return res.status(e.httpCode).send(`${e.error.message} : ${e.reason}`);
    }
    return res.status(500).send(e.message);
  }
});

router.put("/enable", async (req, res, next) => {
  try {
    let itemId = _.get(req.query, "itemId");
    if (_.isEmpty(itemId)) {
      throw new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.MISSING_PARAMETER,
        reason: `require itemId parameter`,
      });
    }

    let brandId = _.get(req.query, "brandId");
    if (_.isEmpty(brandId)) {
      throw new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.MISSING_PARAMETER,
        reason: `require brandId parameter`,
      });
    }

    let alarmObj = {
      brandId,
      id: itemId,
      active: true,
    };
    await Alarm.findOneAndUpdate({ brandId: brandId, id: itemId }, alarmObj, {
      upsert: true,
      new: true,
    });

    return res.status(204);
  } catch (e) {
    if (e instanceof RainbowError) {
      return res.status(e.httpCode).send(`${e.error.message} : ${e.reason}`);
    }
    return res.status(500).send(e.message);
  }
});

router.put("/disable", async (req, res, next) => {
  try {
    let itemId = _.get(req.query, "itemId");
    if (_.isEmpty(itemId)) {
      throw new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.MISSING_PARAMETER,
        reason: `require itemId parameter`,
      });
    }

    let brandId = _.get(req.query, "brandId");
    if (_.isEmpty(brandId)) {
      throw new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.MISSING_PARAMETER,
        reason: `require brandId parameter`,
      });
    }

    let alarmObj = {
      brandId,
      id: itemId,
      active: false,
    };
    await Alarm.findOneAndUpdate({ brandId: brandId, id: itemId }, alarmObj, {
      upsert: true,
      new: true,
    });

    return res.status(204);
  } catch (e) {
    if (e instanceof RainbowError) {
      return res.status(e.httpCode).send(`${e.error.message} : ${e.reason}`);
    }
    return res.status(500).send(e.message);
  }
});

module.exports = router;
