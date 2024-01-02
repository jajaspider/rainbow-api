const _ = require("lodash");
const fs = require("fs");

const DB = require("../../models"),
  CurrencyRange = DB.CurrencyRange,
  ForeignRate = DB.ForeignRate,
  CurrencyCalc = DB.CurrencyCalc;
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

    let usdAmount = 0;
    let currencyAmount = _range;
    //USD가 아닐경우
    if (currency != "USD") {
      let foreignRate = await ForeignRate.findOne({
        from_currency: currency,
        to_currency: "USD",
        date: inquiryDate,
      });
      foreignRate = utils.toJSON(foreignRate);
      usdAmount = Math.round(currencyAmount * foreignRate.rate * 100) / 100;
    } else {
      usdAmount = currencyAmount;
    }

    let usdAmountAddVisa = Math.floor(usdAmount * 1.011 * 100) / 100;
    let krwAmount = Math.floor(usdAmountAddVisa * krwRate.rate);

    let krwAmountAddFee =
      krwAmount + Math.floor(usdAmountAddVisa * 0.0018 * krwRate.rate);

    krws.push(krwAmountAddFee);
    calcList.push({
      currency,
      currencyAmount: currencyAmount,
      currencyAmountVisa: usdAmountAddVisa,
      krwAmount: krwAmountAddFee,
      beforeKrw: krwAmount,
      krwFee: Math.floor(usdAmountAddVisa * 0.0018 * krwRate.rate),
      date: inquiryDate,
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
    usdAmount = Math.round(currencyAmount * foreignRate.rate * 100) / 100;
  } else {
    usdAmount = currencyAmount;
  }

  let usdAmountAddVisa = Math.floor(usdAmount * 1.011 * 100) / 100;
  let krwAmount = Math.floor(usdAmountAddVisa * krwRate.rate);

  let krwAmountAddFee =
    krwAmount + Math.floor(usdAmountAddVisa * 0.0018 * krwRate.rate);

  return krwAmountAddFee;
}

module.exports = { currencyRange, calculateKRWRange, calculateKRW };
