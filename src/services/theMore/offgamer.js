const _ = require("lodash");
const dayjs = require("dayjs");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");

dayjs.extend(utc);
dayjs.extend(timezone);

const DB = require("../../models"),
  Offgamer = DB.Offgamer,
  OffgamerHistory = DB.OffgamerHistory,
  OffgamerMeta = DB.OffgamerMeta;
const { calculateKRW } = require("./index");
const utils = require("../../utils");

async function exchangeRate(currency, amount, name, url) {
  // 주어진 날짜
  let givenDate = dayjs().tz("Asia/Seoul");

  let metas = await OffgamerMeta.find({ currency });
  metas = utils.toJSON(metas);

  for (let _meta of metas) {
    let currency = _.get(_meta, "currency");
    let decimal = _.get(_meta, "point");
    let percentFee = _.get(_meta, "percent_fee");
    let staticFee = _.get(_meta, "static_fee");

    let price =
      Math.round(amount * (1 * Math.pow(10, decimal) + percentFee)) /
      Math.pow(10, decimal);

    price = (price * 100 + staticFee * 100) / 100;

    let result = await calculateKRW(
      currency,
      price,
      givenDate.format("YYYYMMDD")
    );

    await Offgamer.create({
      currency,
      method: _.get(_meta, "method"),
      origin_amount: amount,
      currency_amount: price,
      krw_amount: result.krwAmount,
      product_url: url,
      product_name: name,
      date: givenDate.format("YYYYMMDD"),
    });

    await OffgamerHistory.create({
      currency,
      method: _.get(_meta, "method"),
      origin_amount: amount,
      currency_amount: price,
      krw_amount: result.krwAmount,
      product_url: url,
      product_name: name,
      date: givenDate.format("YYYYMMDD"),
    });
  }

  return;
}

module.exports = { exchangeRate };
