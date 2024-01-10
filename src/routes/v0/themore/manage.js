const express = require("express");
const router = express.Router();
const _ = require("lodash");
const dayjs = require("dayjs");

const DB = require("../../../models"),
  CurrencyCalc = DB.CurrencyCalc,
  Currency = DB.Currency;
const { RainbowError, ERROR_CODE } = require("../../../core/constants");
const { calculateKRWRange } = require("../../../services/theMore");
const utils = require("../../../utils");

router.post("/reGenerating", async function (req, res, next) {
  try {
    let givenDate = dayjs();
    let inquiryDate = _.get(req.body, "date", givenDate.format("YYYYMMDD"));

    await CurrencyCalc.deleteMany({ date: inquiryDate });

    let currency = await Currency.find({ active: true });
    currency = utils.toJSON(currency);
    _.map(currency, (_data) => {
      calculateKRWRange(_data.currency, inquiryDate);
    });

    return res.json({});
  } catch (e) {
    //
    if (e instanceof RainbowError) {
      return res.status(e.httpCode).send(`${e.error.message} : ${e.reason}`);
    }
    return res.status(500).send(e.message);
  }
});

router.post("/currency", async function (req, res, next) {
  try {
    let givenDate = dayjs();
    let inquiryDate = givenDate.format("YYYYMMDD");

    dayjs.locale("ko");

    let currency = _.get(req.body, "currency");
    if (!currency) {
      throw new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.MISSING_PARAMETER,
        reason: `require currency parameter`,
      });
    }

    let active = _.get(req.body, "active");
    if (!active) {
      throw new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.MISSING_PARAMETER,
        reason: `require active parameter`,
      });
    }

    if (active) {
      await CurrencyCalc.deleteMany({ date: inquiryDate, currency: currency });

      calculateKRWRange(currency, inquiryDate);
    }

    await Currency.updateOne({ currency }, { active });
    return res.json({});
  } catch (e) {
    //
    if (e instanceof RainbowError) {
      return res.status(e.httpCode).send(`${e.error.message} : ${e.reason}`);
    }
    return res.status(500).send(e.message);
  }
});

module.exports = router;
