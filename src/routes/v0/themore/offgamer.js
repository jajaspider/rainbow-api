const express = require("express");
const router = express.Router();
const _ = require("lodash");
const dayjs = require("dayjs");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");

dayjs.extend(utc);
dayjs.extend(timezone);

const DB = require("../../../models"),
  Offgamer = DB.Offgamer;
const { RainbowError, ERROR_CODE } = require("../../../core/constants");
const { exchangeRate } = require("../../../services/theMore/offgamer");

router.get("/", async function (req, res, next) {
  try {
    // 주어진 날짜
    let givenDate = dayjs().tz("Asia/Seoul");
    let inquiryDate = _.get(req.query, "date", givenDate.format("YYYYMMDD"));

    let result = await Offgamer.find({ date: inquiryDate });
    return res.json(result);
  } catch (e) {
    //
    if (e instanceof RainbowError) {
      return res.status(e.httpCode).send(`${e.error.message} : ${e.reason}`);
    }
    return res.status(500).send(e.message);
  }
});

router.post("/", async function (req, res, next) {
  try {
    // 주어진 날짜
    let givenDate = dayjs().tz("Asia/Seoul");

    let reqBody = _.get(req, "body");

    let productName = _.get(reqBody, "product_name");
    if (!productName) {
      throw new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.MISSING_PARAMETER,
        reason: `require product_name`,
      });
    }
    let productUrl = _.get(reqBody, "url");

    let currency = _.get(reqBody, "currency");
    if (!currency) {
      throw new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.MISSING_PARAMETER,
        reason: `require currency`,
      });
    }
    let amount = _.get(reqBody, "amount");
    if (!amount) {
      throw new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.MISSING_PARAMETER,
        reason: `require amount`,
      });
    }

    await exchangeRate(currency, amount, productName, productUrl);
    return res.json({});
  } catch (e) {
    console.dir(e);
    if (e instanceof RainbowError) {
      return res.status(e.httpCode).send(`${e.error.message} : ${e.reason}`);
    }
    return res.status(500).send(e.message);
  }
});

router.delete("/", async function (req, res, next) {
  try {
    let koreanTime = dayjs().tz("Asia/Seoul");
    // 주어진 날짜
    let inquiryDate = _.get(req.query, "date");
    if (!inquiryDate) {
      inquiryDate = koreanTime.format("YYYYMMDD");
    }

    let productName = _.get(req.query, "product_name");
    if (_.isEmpty(productName)) {
      throw new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.MISSING_PARAMETER,
        reason: `require product_name`,
      });
    }
    await Offgamer.deleteMany({ date: inquiryDate, product_name: productName });
    return res.json({});
  } catch (e) {
    console.dir(e);
    if (e instanceof RainbowError) {
      return res.status(e.httpCode).send(`${e.error.message} : ${e.reason}`);
    }
    return res.status(500).send(e.message);
  }
});

module.exports = router;
