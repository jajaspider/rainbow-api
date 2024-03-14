const axios = require("axios");
const _ = require("lodash");

const NCNCAlarm = require("../../models").NCNCAlarm;
const utils = require("../../utils");
const NCNCService = require("../../services/ncnc");
const telegramService = require("../../services/telegram");

async function checkStatus() {
  let alarm = await NCNCAlarm.find({ active: true });
  alarm = utils.toJSON(alarm);

  if (_.isEmpty(alarm)) {
    return;
  }

  for (let _alarm of alarm) {
    let result = await NCNCService.getItemStatus(_alarm.brandId, _alarm.id);
    if (_.isEmpty(result)) {
      continue;
    }

    let isBlock = _.get(result, "isBlock");
    let isRefuse = _.get(result, "isRefuse");
    if (isBlock == 0 && isRefuse == 0) {
      let targetItem = await NCNCService.getItemById(_alarm.id);
      let noticeText = `${targetItem.brandName} ${targetItem.name}(${result.askingPrice}) 매입중`;
      await telegramService.sendMessage(_alarm.chat_id, noticeText);
    }
  }
}

module.exports = checkStatus;
