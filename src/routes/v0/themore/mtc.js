const express = require("express");
const router = express.Router();
const _ = require("lodash");
const dayjs = require("dayjs");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");

dayjs.extend(utc);
dayjs.extend(timezone);

const DB = require("../../../models"),
  Mtcgame = DB.Mtcgame;
const { RainbowError, ERROR_CODE } = require("../../../core/constants");
const { exchangeRate } = require("../../../services/theMore/mtc");

router.get("/", async function (req, res, next) {
  try {
    // 주어진 날짜
    let givenDate = dayjs().tz("Asia/Seoul");
    let inquiryDate = _.get(req.query, "date", givenDate.format("YYYYMMDD"));

    let result = await Mtcgame.find({ date: inquiryDate });
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
  // 주어진 날짜
  let koreanTime = dayjs().tz("Asia/Seoul");
  let inquiryDate = _.get(req.query, "date");
  if (!inquiryDate) {
    inquiryDate = koreanTime.format("YYYYMMDD");
  }
  await Mtcgame.deleteMany({ date: inquiryDate });
  return res.json({});
});

module.exports = router;
