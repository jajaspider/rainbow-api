const schedule = require("node-schedule");
const dayjs = require("dayjs");
const _ = require("lodash");
const axios = require("axios");

const DB = require("../../models"),
  ForeignRate = DB.ForeignRate;
const { calculateKRWRange } = require("../../services/theMore");

// 매일 아침 9시에 실행되는 함수
const shinhan = async () => {
  console.dir("매일 아침 8시 40분 신한 data 파싱 시작");

  let givenDate = dayjs();
  let inquiryDate = givenDate.format("YYYYMMDD");

  let shinhanUrl = `https://bank.shinhan.com/serviceEndpoint/httpDigital`;
  let reqBody = {
    dataBody: {
      ricInptRootInfo: {
        serviceType: "GU",
      },
      조회구분: "",
      고시회차: 1,
      조회일자_display: "",
    },
    dataHeader: {
      trxCd: "RSHRC0213A01",
      language: "ko",
      subChannel: "51",
      channelGbn: "D0",
    },
  };
  _.set(reqBody, "dataBody.조회일자", inquiryDate);

  try {
    let result = await axios.post(shinhanUrl, reqBody);

    let data = _.get(result, "data.dataBody");
    let displayDate = `${_.get(data, "고시일자_display")} ${_.get(
      data,
      "고시시간_display"
    )}`;
    let currencies = _.get(data, "R_RIBF3730_1");
    let findUSD = _.find(currencies, { 통화CODE: "USD" });
    let usd = _.get(findUSD, "전신환매도환율");

    await ForeignRate.create({
      from_currency: "USD",
      to_currency: "KRW",
      rate: usd,
      date: inquiryDate,
      noticeTime: displayDate,
    });
    await calculateKRWRange("USD", inquiryDate);
    console.dir("신한 data 파싱 완료");
    return usd;
  } catch (e) {
    //
    console.dir(e);
  }
};

// 규칙 설정: 매일 아침 8시40분에 실행
const rule = new schedule.RecurrenceRule();
rule.tz = "Asia/Seoul"; // 한국 시간대
rule.hour = 8;
rule.minute = 40;
rule.second = 0;

// 작업 예약
const job = schedule.scheduleJob(rule, shinhan);
console.dir("매일 아침 8시 40분 신한 파싱 작업 대기");
