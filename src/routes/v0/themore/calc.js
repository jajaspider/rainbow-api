const express = require("express");
const router = express.Router();
const _ = require("lodash");
const dayjs = require("dayjs");

const DB = require("../../../models"),
  CurrencyCalc = DB.CurrencyCalc,
  Currency = DB.Currency;
const { RainbowError, ERROR_CODE } = require("../../../core/constants");
const { calculateKRW } = require("../../../services/theMore");
const utils = require("../../../utils");

router.get("/", async function (req, res, next) {
  try {
    dayjs.locale("ko");

    // 주어진 날짜
    let inquiryDate = _.get(req.query, "date");
    if (!inquiryDate) {
      inquiryDate = dayjs().format("YYYYMMDD");
      if (dayjs().hour() < 9) {
        inquiryDate = dayjs().subtract(1, "day").format("YYYYMMDD");
      }
    }
    let currency = _.get(req.query, "currency");
    if (!currency) {
      throw new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.MISSING_PARAMETER,
        reason: `require currency parameter`,
      });
    }

    let result = await CurrencyCalc.find({ currency, date: inquiryDate });
    return res.json(result);
  } catch (e) {
    //
    if (e instanceof RainbowError) {
      return res.status(e.httpCode).send(`${e.error.message} : ${e.reason}`);
    }
    return res.status(500).send(e.message);
  }
});

router.get("/allCurrency", async function (req, res, next) {
  try {
    dayjs.locale("ko");

    let inquiryDate = _.get(req.query, "date");
    if (!inquiryDate) {
      inquiryDate = dayjs().format("YYYYMMDD");
      if (dayjs().hour() < 9) {
        inquiryDate = dayjs().subtract(1, "day").format("YYYYMMDD");
      }
    }

    let result = await CurrencyCalc.find({
      date: inquiryDate,
      krwAmountDisplay: { $regex: /^5\d{3}$/ },
    });
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

    let inquiryDate = _.get(req.query, "date");
    if (!inquiryDate) {
      inquiryDate = dayjs().format("YYYYMMDD");
      if (dayjs().hour() < 9) {
        inquiryDate = dayjs().subtract(1, "day").format("YYYYMMDD");
      }
    }
    let currency = _.get(req.query, "currency");
    if (!currency) {
      throw new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.MISSING_PARAMETER,
        reason: `require currency parameter`,
      });
    }

    let currencies = await Currency.find({ currency, active: true });
    utils.toJSON(currencies);
    if (_.isEmpty(currencies)) {
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
