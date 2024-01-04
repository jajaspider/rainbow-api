const express = require("express");
const router = express.Router();
const _ = require("lodash");
const dayjs = require("dayjs");

const DB = require("../../../models"),
  Moogold = DB.Moogold;
const { RainbowError } = require("../../../core/constants");
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
    await exchangeRate();
    return res.json({});
  } catch (e) {
    if (e instanceof RainbowError) {
      return res.status(e.httpCode).send(`${e.error.message} : ${e.reason}`);
    }
    return res.status(500).send(e.message);
  }
});

module.exports = router;
