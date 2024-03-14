const axios = require("axios");
const _ = require("lodash");
const dayjs = require("dayjs");
const schedule = require("node-schedule");

const rabbitmq = require("../rabbitmq");
const NoticeDB = require("../../models").Notice;
const { sendMessage } = require("../../services/theMore/telegram.handler");
const { calculateKRW } = require("../../services/theMore");

function transformAndRound(number) {
  if (number >= 1000 && number < 10000) {
    return Math.ceil(number);
  } else if (number >= 100 && number < 1000) {
    return Math.ceil(number * 10) / 10;
  } else if (number >= 10 && number < 100) {
    return Math.ceil(number * 100) / 100;
  } else if (number >= 0 && number < 10) {
    return Math.ceil(number * 1000) / 1000;
  }
  return number;
}

const crawling = async () => {
  let prefix = "https://stsg-a.image-gmkt.com/js3";
  try {
    let yyyymmdd = dayjs().format("YYYYMMDD");
    let targetUrl = `${prefix}/constant_value.v_${yyyymmdd}11.js`;
    let result = await axios.get(targetUrl);
    let data = _.get(result, "data");

    eval(data);

    let exchangeInfo = exchange_info;

    let currencyList = [
      //   "SGD",
      "USD",
      "KRW",
      "JPY",
      "CNY",
      "HKD",
      "MYR",
      "GBP",
      "AUD",
      "IDR",
    ];

    let resultList = [{ currency: "SGD", amount: 10 }];

    for (let _currency of currencyList) {
      let exchange = _.find(exchangeInfo, { sc_cd: "SGD", tc_cd: _currency });

      let result = transformAndRound(exchange.ie_r);
      result = result * exchange.t_u * 10;

      resultList.push({
        currency: _currency,
        amount: result,
      });
    }

    let qooCoinList = [];
    for (let _result of resultList) {
      let result = await calculateKRW(
        _result.currency,
        _result.amount,
        yyyymmdd
      );

      qooCoinList.push({
        currency: _result.currency,
        amount: _result.amount,
        krwAmount: result.krwAmount,
        efficiency: result.efficiency,
      });
    }

    qooCoinList = _.sortBy(qooCoinList, ["efficiency"]);
    qooCoinList = _.reverse(qooCoinList);

    let noticeMessage = "\n";
    for (let _qooCoin of qooCoinList) {
      noticeMessage += `${_qooCoin.amount} ${_qooCoin.currency}\n금액 : ${_qooCoin.krwAmount}, 효율 : ${_qooCoin.efficiency}%\n\n`;
    }

    let publishObj = {
      url: noticeMessage,
      title: "큐코인 가격(베타)",
      type: "themoreNotice",
    };

    await NoticeDB.create(publishObj);
    await rabbitmq.assertQueue("notice.themore");
    await rabbitmq.bindQueue(
      "notice.themore",
      rabbitmq.mqConfig.exchange,
      "notice"
    );
    await rabbitmq.sendToQueue("notice.themore", publishObj);
    await sendMessage(publishObj.title, publishObj.url);
  } catch (e) {
    console.dir(e);
  }
};

const rule = new schedule.RecurrenceRule();
rule.tz = "Asia/Seoul";
rule.hour = 11;
rule.minute = 5;
rule.second = 0;

// 작업 예약
const job = schedule.scheduleJob(rule, crawling);
