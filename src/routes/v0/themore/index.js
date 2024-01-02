const express = require("express");
const router = express.Router();

const foreignRateRouter = require("./foreignRate");
const calculatorRouter = require("./calc");

const { CURRENCY_LIST } = require("../../../core/constants");

router.get("/", (req, res, next) => {
  return res.json(CURRENCY_LIST);
});

router.use("/foreignRate", foreignRateRouter);
router.use("/calculator", calculatorRouter);

module.exports = router;
