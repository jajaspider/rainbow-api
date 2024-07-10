const axios = require("axios");

const { sendMessage } = require("./theMore/telegram.handler");
const rabbitmq = require("../core/rabbitmq");

const voucherService = {
  sendNotice: async (title, text) => {
    // console.dir({ type: "console 메세지", title, text });
    try {
      await sendMessage(title, text);
    } catch (e) {
      //
    }

    try {
      let publishObj = {
        url: text,
        title: title,
      };
      await rabbitmq.assertQueue("notice.financial");
      await rabbitmq.bindQueue(
        "notice.financial",
        rabbitmq.mqConfig.exchange,
        "notice"
      );
      await rabbitmq.sendToQueue("notice.financial", publishObj);
    } catch (e) {
      //
    }

    try {
      let djjObj = {
        msg: `${title}\n${text}`,
        dst: "",
        key: "d4b80164-72b2-462b-8a54-0927c8f15714",
      };
      await axios.post(`https://bmonbot.djjproject.com/send`, djjObj);
    } catch (e) {
      //
    }
  },
};

module.exports = voucherService;
