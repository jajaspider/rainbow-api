const _ = require("lodash");
const dayjs = require("dayjs");

const DB = require("../../models"),
  Moogold = DB.Moogold,
  MoogoldMeta = DB.MoogoldMeta;
const { calculateKRW } = require("./index");
const utils = require("../../utils");

async function exchangeRate(currency, amount, name, url) {
  dayjs.locale("ko");
  // 주어진 날짜
  let givenDate = dayjs();

  let metas = await MoogoldMeta.find({ currency });
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

    await Moogold.create({
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
