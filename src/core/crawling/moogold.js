const schedule = require("node-schedule");

const { exchangeRate } = require("../../services/theMore/moogold");

// 규칙 설정: 매일 아침 9시에 실행
const rule = new schedule.RecurrenceRule();
rule.tz = "Asia/Seoul"; // 한국 시간대
rule.hour = 9;
rule.minute = 10;
rule.second = 0;

// 작업 예약
const job = schedule.scheduleJob(rule, exchangeRate);

// 수동실행해야하는 경우
// exchangeRate();
