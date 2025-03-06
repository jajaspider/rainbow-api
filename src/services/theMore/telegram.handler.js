const axios = require("axios");
const _ = require("lodash");

async function sendMessage(title, text) {
  let url = "http://push.5999.kr/telegram/send";
  await axios.post(url, { title, text });
}

// sendMessage("메세지 테스트", "발송준비");

module.exports = { sendMessage };
