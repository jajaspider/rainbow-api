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
  AUD: 7.86,
  BDT: 670.39,
  BRL: 25.3,
  CAD: 7.12,
  CLP: 4895,
  CNY: 39.37,
  EGP: 180.59,
  EUR: 4.97,
  GBP: 4.35,
  HKD: 40.52,
  INR: 460.62,
  IDR: 84748.35,
  JPY: 785,
  KRW: 7116,
  MYR: 24.44,
  MXN: 87.72,
  NZD: 8.45,
  PHP: 285.6,
  RUB: 0,
  SAR: 19.61,
  SGD: 7.1,
  THB: 192.97,
  TRY: 157.24,
  TWD: 172.55,
  UYU: 217.47,
  VND: 134861.55,
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
  }
}

module.exports = { exchangeRate };
