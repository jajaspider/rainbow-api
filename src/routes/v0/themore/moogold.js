const express = require("express");
const router = express.Router();
const _ = require("lodash");
const dayjs = require("dayjs");

const DB = require("../../../models"),
  Moogold = DB.Moogold;
const { RainbowError, ERROR_CODE } = require("../../../core/constants");
const { exchangeRate } = require("../../../services/theMore/moogold");

router.get("/", async function (req, res, next) {
  try {
    dayjs.locale("ko");

    // 주어진 날짜
    let givenDate = dayjs();
    let inquiryDate = _.get(req.query, "date", givenDate.format("YYYYMMDD"));

    let result = await Moogold.find({ date: inquiryDate });
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
    let givenDate = dayjs();

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

module.exports = router;
