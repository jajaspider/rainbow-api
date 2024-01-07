const _ = require("lodash");
const fs = require("fs");

const DB = require("../../models"),
  CurrencyRange = DB.CurrencyRange,
  ForeignRate = DB.ForeignRate,
  CurrencyCalc = DB.CurrencyCalc;
const { RainbowError, ERROR_CODE } = require("../../core/constants");
const utils = require("../../utils");
const dayjs = require("dayjs");

function* currencyRange(start, end, point) {
  for (let i = start; i <= end; i += 1 / Math.pow(10, point)) {
    yield i;
  }
}

async function calculateKRWRange(currency) {
  let result = await CurrencyRange.findOne({ currency });
  result = utils.toJSON(result);
  if (_.isEmpty(result)) {
    return [];
  }

  let givenDate = dayjs();
  let inquiryDate = givenDate.format("YYYYMMDD");
  let krwRate = await ForeignRate.findOne({
    from_currency: "USD",
    to_currency: "KRW",
    date: inquiryDate,
  });
  krwRate = utils.toJSON(krwRate);

  let calcList = [];
  let krws = [];

  for (let _range of currencyRange(result.from, result.to, result.point)) {
    _range =
      Math.round(_range * Math.pow(10, result.point)) /
      Math.pow(10, result.point);

    let krwAmount = await calculateKRW(currency, _range, inquiryDate);

    krws.push(krwAmount.krwAmount);
    calcList.push({
      currency,
      currencyAmount: currencyAmount,
      krwAmount: krwAmount.krwAmount,
      date: inquiryDate,
      origin: krwAmount.origin,
    });
  }

  //   fs.writeFileSync("./temp.json", JSON.stringify(calcList));

  for (let i = 5; i < 15; i += 1) {
    const maxNumber = findMaxNumberInRange(krws, i);
    await CurrencyCalc.create(_.findLast(calcList, { krwAmount: maxNumber }));
  }
}

function findMaxNumberInRange(numbers, rangeStart) {
  const regex = new RegExp(`^${rangeStart}\\d{3}$`);
  const filteredNumbers = numbers.filter((num) => regex.test(num.toString()));

  const maxNumberInRange = Math.max(...filteredNumbers);
  return maxNumberInRange;
}

async function calculateKRW(currency, amount, date) {
  let krwRate = await ForeignRate.findOne({
    from_currency: "USD",
    to_currency: "KRW",
    date: date,
  });
  krwRate = utils.toJSON(krwRate);
  if (_.isEmpty(krwRate)) {
    throw new RainbowError({
      httpCode: 400,
      error: ERROR_CODE.DATA_NOT_FOUND,
      reason: `not found krw rate`,
    });
  }

  let usdAmount = 0;
  let currencyAmount = amount;
  //USD가 아닐경우
  if (currency != "USD") {
    let foreignRate = await ForeignRate.findOne({
      from_currency: currency,
      to_currency: "USD",
      date: date,
    });
    foreignRate = utils.toJSON(foreignRate);
    if (_.isEmpty(foreignRate)) {
      throw new RainbowError({
        httpCode: 400,
        error: ERROR_CODE.DATA_NOT_FOUND,
        reason: `not found ${currency} rate`,
      });
    }
    // 수식 검증 필요
    //프로테크로직
    // usdAmount = Math.round(currencyAmount * foreignRate.rate * 100) / 100;
    //가설2. 셋째반올림하기전에 브랜드수수료인 1.1%를 적용한후 셋째반올림을 한다
    usdAmount = currencyAmount * foreignRate.rate;
  } else {
    usdAmount = currencyAmount;
  }

  //프로테크로직
  // let usdAmountAddVisa = Math.floor(usdAmount * 1.011 * 100) / 100;
  //가설2. 셋째반올림하기전에 브랜드수수료인 1.1%를 적용한후 셋째반올림을 한다
  let usdAmountAddVisa = Math.round(usdAmount * 1.011 * 100) / 100;
  let krwAmount = Math.floor(usdAmountAddVisa * krwRate.rate);

  let krwAmountAddFee =
    krwAmount + Math.floor(usdAmountAddVisa * 0.0018 * krwRate.rate);

  return {
    krwAmount: krwAmountAddFee,
    origin: {
      currency: currency,
      currencyAmount: amount,
      usdAmount,
      usdAmountAddVisa,
      krwAmount,
      krwFee: Math.floor(usdAmountAddVisa * 0.0018 * krwRate.rate),
      krwAmountAddFee,
      date,
    },
  };
}

module.exports = { currencyRange, calculateKRWRange, calculateKRW };
