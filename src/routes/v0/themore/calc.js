const express = require("express");
const router = express.Router();
const _ = require("lodash");
const dayjs = require("dayjs");

const DB = require("../../../models"),
  CurrencyCalcalc = DB.CurrencyCalc;
const {
  RainbowError,
  ERROR_CODE,
  CURRENCY_LIST,
} = require("../../../core/constants");
const { calculateKRW } = require("../../../services/theMore");

router.get("/", async function (req, res, next) {
  try {
    dayjs.locale("ko");

    // 주어진 날짜
    let givenDate = dayjs();
    let inquiryDate = _.get(req.query, "date", givenDate.format("YYYYMMDD"));
    let currency = _.get(req.query, "currency");
    if (!currency) {
      throw new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.MISSING_PARAMETER,
        reason: `require currency parameter`,
      });
    }

    let result = await CurrencyCalcalc.find({ currency, date: inquiryDate });
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
    dayjs.locale("ko");

    // 주어진 날짜
    let givenDate = dayjs();
    let inquiryDate = _.get(req.query, "date", givenDate.format("YYYYMMDD"));
    let currency = _.get(req.query, "currency");
    if (!currency) {
      throw new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.MISSING_PARAMETER,
        reason: `require currency parameter`,
      });
    } else if (!_.includes(CURRENCY_LIST, currency)) {
      throw new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.DATA_NOT_FOUND,
        reason: `not support currency`,
      });
    }

    let amount = _.get(req.query, "amount");
    if (!amount) {
      throw new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.MISSING_PARAMETER,
        reason: `require amount parameter`,
      });
    }

    let result = await calculateKRW(currency, amount, inquiryDate);
    return res.json(result.krwAmount);
  } catch (e) {
    //
    if (e instanceof RainbowError) {
      return res.status(e.httpCode).send(`${e.error.message} : ${e.reason}`);
    }
    return res.status(500).send(e.message);
  }
});

module.exports = router;
