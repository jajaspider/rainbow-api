const express = require("express");
const router = express.Router();
const _ = require("lodash");
const axios = require("axios");

const { RainbowError, ERROR_CODE } = require("../../../core/constants");
const ncncService = require("../../../services/ncnc");

const alarmRouter = require("./alarm");
router.use("/alarm", alarmRouter);

router.get("/getCategory", async (req, res, next) => {
  try {
    let category = await ncncService.getCategory();
    return res.json(category);
  } catch (e) {
    if (e instanceof RainbowError) {
      return res.status(e.httpCode).send(`${e.error.message} : ${e.reason}`);
    }
    return res.status(500).send(e.message);
  }
});

router.put("/updateCategory", async (req, res, next) => {
  try {
    await ncncService.updateCategory();
    return res.json({});
  } catch (e) {
    if (e instanceof RainbowError) {
      return res.status(e.httpCode).send(`${e.error.message} : ${e.reason}`);
    }
    return res.status(500).send(e.message);
  }
});

router.get("/getBrand", async (req, res, next) => {
  try {
    let brand = await ncncService.getBrand();
    return res.json(brand);
  } catch (e) {
    if (e instanceof RainbowError) {
      return res.status(e.httpCode).send(`${e.error.message} : ${e.reason}`);
    }
    return res.status(500).send(e.message);
  }
});

router.put("/updateBrand", async (req, res, next) => {
  try {
    await ncncService.updateBrand();
    return res.json({});
  } catch (e) {
    if (e instanceof RainbowError) {
      return res.status(e.httpCode).send(`${e.error.message} : ${e.reason}`);
    }
    return res.status(500).send(e.message);
  }
});

router.get("/getItem", async (req, res, next) => {
  try {
    let itemName = _.get(req.query, "name");
    if (_.isEmpty(itemName)) {
      throw new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.MISSING_PARAMETER,
        reason: `require name parameter`,
      });
    }
    let item = await ncncService.getItemByName(itemName);

    return res.json(item);
  } catch (e) {
    if (e instanceof RainbowError) {
      return res.status(e.httpCode).send(`${e.error.message} : ${e.reason}`);
    }
    return res.status(500).send(e.message);
  }
});

router.get("/getItemStatus", async (req, res, next) => {
  try {
    let itemId = _.get(req.query, "id");
    if (_.isEmpty(itemId)) {
      throw new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.MISSING_PARAMETER,
        reason: `require id parameter`,
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
    let itemStatus = await ncncService.getItemStatus(brandId, itemId);

    return res.json(itemStatus);
  } catch (e) {
    if (e instanceof RainbowError) {
      return res.status(e.httpCode).send(`${e.error.message} : ${e.reason}`);
    }
    return res.status(500).send(e.message);
  }
});

module.exports = router;
