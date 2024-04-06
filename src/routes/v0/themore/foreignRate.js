const express = require("express");
const router = express.Router();
const _ = require("lodash");
const dayjs = require("dayjs");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");

dayjs.extend(utc);
dayjs.extend(timezone);

const DB = require("../../../models"),
  ForeignRate = DB.ForeignRate;
const { RainbowError, ERROR_CODE } = require("../../../core/constants");
const utils = require("../../../utils");
const { calculateKRWRange } = require("../../../services/theMore");

router.post("/", async function (req, res, next) {
  try {
    // 주어진 날짜
    let givenDate = dayjs().tz("Asia/Seoul");

    let reqBody = _.get(req, "body");

    let fromCurrency = _.get(reqBody, "from_currency");
    if (!fromCurrency) {
      throw new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.MISSING_PARAMETER,
        reason: `require from_currency`,
      });
    }
    let toCurrency = _.get(reqBody, "to_currency");
    if (!toCurrency) {
      throw new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.MISSING_PARAMETER,
        reason: `require to_currency`,
      });
    }
    let rate = _.get(reqBody, "rate");
    if (!rate) {
      throw new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.MISSING_PARAMETER,
        reason: `require rate`,
      });
    }
    let noticeTime = _.get(reqBody, "notice_time");
    if (!noticeTime) {
      throw new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.MISSING_PARAMETER,
        reason: `require notice_time`,
      });
    }
    let inquiryDate = _.get(reqBody, "date", givenDate.format("YYYYMMDD"));

    let krwRate = await ForeignRate.findOne({
      from_currency: "USD",
      to_currency: "KRW",
      date: inquiryDate,
    });
    krwRate = utils.toJSON(krwRate);
    if (_.isEmpty(krwRate)) {
      if (fromCurrency == "USD" && toCurrency == "KRW") {
        krwRate = await ForeignRate.create({
          from_currency: fromCurrency,
          to_currency: toCurrency,
          rate: rate,
          date: inquiryDate,
          notice_time: noticeTime,
        });

        await calculateKRWRange(fromCurrency, inquiryDate);
        return res.json(krwRate);
      }
      throw new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.DATA_NOT_FOUND,
        reason: "not found krw rate",
      });
    }

    let foreignRate = await ForeignRate.findOne({
      from_currency: fromCurrency,
      to_currency: toCurrency,
      date: inquiryDate,
    });
    if (!_.isEmpty(foreignRate)) {
      throw new RainbowError({
        httpCode: 409,
        error: ERROR_CODE.EXIST_DATA,
        reason: ERROR_CODE.EXIST_DATA.message,
      });
    }
    foreignRate = utils.toJSON(foreignRate);

    let result = await ForeignRate.create({
      from_currency: fromCurrency,
      to_currency: toCurrency,
      rate: rate,
      date: inquiryDate,
      notice_time: noticeTime,
    });
    // console.dir(calculateKRWRange);
    calculateKRWRange(fromCurrency, inquiryDate);
    return res.json(result);
  } catch (e) {
    console.dir(e);
    //
    if (e instanceof RainbowError) {
      return res.status(e.httpCode).send(`${e.error.message} : ${e.reason}`);
    }
    return res.status(500).send(e.message);
  }
});

router.get("/", async function (req, res, next) {
  try {
    let koreanTime = dayjs().tz("Asia/Seoul");
    // 주어진 날짜
    let inquiryDate = _.get(req.query, "date");
    if (!inquiryDate) {
      inquiryDate = koreanTime.format("YYYYMMDD");
      if (koreanTime.hour() < 9) {
        inquiryDate = koreanTime.subtract(1, "day").format("YYYYMMDD");
      }
    }

    let foreignRates = await ForeignRate.find({
      date: inquiryDate,
    });
    foreignRates = utils.toJSON(foreignRates);

    return res.json(foreignRates);
  } catch (e) {
    //
    if (e instanceof RainbowError) {
      return res.status(e.httpCode).send(`${e.error.message} : ${e.reason}`);
    }
    return res.status(500).send(e.message);
  }
});

module.exports = router;
