const express = require("express");
const router = express.Router();

const foreignRateRouter = require("./foreignRate");
const calculatorRouter = require("./calc");
const moogoldRouter = require("./moogold");
const offgamerRouter = require("./offgamer");
const mtcgameRouter = require("./mtc");
const manageRouter = require("./manage");

const DB = require("../../../models"),
  Currency = DB.Currency;

const utils = require("../../../utils");

const currencyList = [
  {
    currency: "USD",
    currencyDisplay: "미국 달러",
    active: true,
  },
  {
    currency: "AED",
    currencyDisplay: "아랍에미리트 디르함",
    active: true,
  },
  {
    currency: "ARS",
    currencyDisplay: "아르헨티나 페소",
    active: true,
  },
  {
    currency: "AUD",
    currencyDisplay: "오스트레일리아 달러",
    active: true,
  },
  {
    currency: "BDT",
    currencyDisplay: "방글라데시 타카",
    active: true,
  },
  {
    currency: "BRL",
    currencyDisplay: "브라질 헤알",
    active: true,
  },
  {
    currency: "CAD",
    currencyDisplay: "캐나다 달러",
    active: true,
  },
  {
    currency: "CHF",
    currencyDisplay: "스위스 프랑",
    active: true,
  },
  {
    currency: "CLP",
    currencyDisplay: "칠레 페소",
    active: true,
  },
  {
    currency: "CNY",
    currencyDisplay: "중국 위안화",
    active: true,
  },
  {
    currency: "DKK",
    currencyDisplay: "덴마크 크로네",
    active: true,
  },
  {
    currency: "EGP",
    currencyDisplay: "이집트 파운드",
    active: true,
  },
  {
    currency: "EUR",
    currencyDisplay: "유로",
    active: true,
  },
  {
    currency: "GBP",
    currencyDisplay: "파운드",
    active: true,
  },
  {
    currency: "HKD",
    currencyDisplay: "홍콩 달러",
    active: true,
  },
  {
    currency: "HUF",
    currencyDisplay: "헝가리 포린트",
    active: true,
  },
  {
    currency: "IDR",
    currencyDisplay: "인도네시아 루피아",
    active: true,
  },
  {
    currency: "INR",
    currencyDisplay: "인도 루피",
    active: true,
  },
  {
    currency: "JPY",
    currencyDisplay: "일본 엔",
    active: true,
  },
  {
    currency: "KRW",
    currencyDisplay: "대한민국 원",
    active: true,
  },
  {
    currency: "LKR",
    currencyDisplay: "스리랑카 루피",
    active: true,
  },
  {
    currency: "MNT",
    currencyDisplay: "몽골 투그릭",
    active: false,
  },
  {
    currency: "MOP",
    currencyDisplay: "마카오 파타카",
    active: true,
  },
  {
    currency: "MXN",
    currencyDisplay: "멕시코 페소",
    active: true,
  },
  {
    currency: "MYR",
    currencyDisplay: "말레이시아 링깃",
    active: true,
  },
  {
    currency: "NGN",
    currencyDisplay: "나이지리아 나이라",
    active: true,
  },
  {
    currency: "NOK",
    currencyDisplay: "노르웨이 크로네",
    active: true,
  },
  {
    currency: "NPR",
    currencyDisplay: "네팔 루피",
    active: true,
  },
  {
    currency: "NZD",
    currencyDisplay: "뉴질랜드 달러",
    active: true,
  },
  {
    currency: "PEN",
    currencyDisplay: "페루 솔",
    active: true,
  },
  {
    currency: "PHP",
    currencyDisplay: "필리핀 페소",
    active: true,
  },
  {
    currency: "PLN",
    currencyDisplay: "폴란드 즈워티",
    active: true,
  },
  {
    currency: "RON",
    currencyDisplay: "루마니아 레우",
    active: true,
  },
  {
    currency: "RUB",
    currencyDisplay: "러시아 루블",
    active: false,
  },
  {
    currency: "SAR",
    currencyDisplay: "사우디아라비아 리얄",
    active: true,
  },
  {
    currency: "SEK",
    currencyDisplay: "스웨덴 크로나",
    active: true,
  },
  {
    currency: "SGD",
    currencyDisplay: "싱가포르 달러",
    active: true,
  },
  {
    currency: "THB",
    currencyDisplay: "태국 밧",
    active: true,
  },
  {
    currency: "TRY",
    currencyDisplay: "터키 리라",
    active: true,
  },
  {
    currency: "TWD",
    currencyDisplay: "타이완 달러",
    active: true,
  },
  {
    currency: "UAH",
    currencyDisplay: "우크라이나 흐리우냐",
    active: false,
  },
  {
    currency: "UYU",
    currencyDisplay: "우루과이 페소",
    active: true,
  },
  {
    currency: "VND",
    currencyDisplay: "베트남 동",
    active: true,
  },
  {
    currency: "ZAR",
    currencyDisplay: "남아프리카 공화국 랜드",
    active: true,
  },
];

router.get("/", async (req, res, next) => {
  let result = await Currency.find({});
  result = utils.toJSON(result);

  return res.json(result);
});

router.use("/foreignRate", foreignRateRouter);
router.use("/calculator", calculatorRouter);
router.use("/moogold", moogoldRouter);
router.use("/offgamer", offgamerRouter);
router.use("/mtcgame", mtcgameRouter);
router.use("/manage", manageRouter);

module.exports = router;
