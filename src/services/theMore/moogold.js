const _ = require("lodash");
const dayjs = require("dayjs");

const DB = require("../../models"),
  Moogold = DB.Moogold;
const { calculateKRW } = require("./index");

// 가격변동없음;
let currencies = {
  USD: 5.45,
  AED: 19.21,
  ARS: 0,
  AUD: 7.98,
  BDT: 668.44,
  BRL: 25.4,
  CAD: 7.19,
  CLP: 4917,
  CNY: 39.49,
  EGP: 179.29,
  EUR: 5.0,
  GBP: 4.35,
  HKD: 40.53,
  INR: 460.65,
  IDR: 85345.14,
  JPY: 804,
  KRW: 7222,
  MYR: 24.75,
  MXN: 87.23,
  NZD: 8.55,
  PHP: 286.16,
  RUB: 0,
  SAR: 19.61,
  SGD: 7.15,
  THB: 194.17,
  TRY: 159.15,
  TWD: 173.86,
  UYU: 216.69,
  VND: 135447.69,
};

async function exchangeRate() {
  dayjs.locale("ko");
  // 주어진 날짜
  let givenDate = dayjs();

  //   https://themorehelp.com/exrate_calculator/?get=rate&currency=ARS&amount=5999
  for (let _currency of _.keys(currencies)) {
    if (currencies[_currency] == 0) {
      continue;
    }

    try {
      let result = await calculateKRW(
        _currency,
        currencies[_currency],
        givenDate.format("YYYYMMDD")
      );
      console.dir({
        currency: _currency,
        currencyAmount: currencies[_currency],
        krwAmount: result.krwAmount,
        date: givenDate.format("YYYYMMDD"),
      });

      await Moogold.create({
        currency: _currency,
        currencyAmount: currencies[_currency],
        krwAmount: result.krwAmount,
        date: givenDate.format("YYYYMMDD"),
      });
    } catch (e) {
      // 만약 문제있는 통화는 제외하도록 함
    }
  }
}

module.exports = { exchangeRate };
