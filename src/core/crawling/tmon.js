const _ = require("lodash");
const axios = require("axios");
const qs = require("querystring");

const Tmon = require("../../models").Tmon;
const { sendMessage } = require("../../services/theMore/telegram.handler");

const requestPagenationQuery = async (url, query) => {
  let result = [];
  try {
    const queryString = qs.stringify(query);
    let requestUrl = `${url}?${queryString}`;

    const response = await axios.get(requestUrl);
    const responseData = _.get(response, "data.data");
    // console.dir(responseData);

    const totalCount = _.get(responseData, "totalCount");
    const pageIndex = _.get(responseData, "pageIndex");
    const itemCount = _.get(responseData, "itemCount");
    const hasNextPage = _.get(responseData, "hasNextPage");
    const items = _.get(responseData, "items");
    console.dir({ totalCount, pageIndex, itemCount, hasNextPage });

    result = _.concat(result, items);
    if (hasNextPage === true) {
      query.page += 1;
      let recursiveResponse = await requestPagenationQuery(url, query);
      result = _.concat(result, recursiveResponse);
    }
    return result;
  } catch (e) {
    console.dir(e);
  }
};

const voucherDetect = async () => {
  let query = {
    size: 100,
    page: 0,
    sortType: "POPULAR",
    platform: "PC_WEB",
  };
  const url = `https://www.tmon.co.kr/api/direct/v1/categorylistapi/api/strategy/filter/80020000/deals`;

  let items = await requestPagenationQuery(url, query);
  //   console.dir(items);

  for (let _item of items) {
    let itemName = _.get(_item, "titleName", "상품명");
    let itemUuid = _.get(_item, "dealNo");
    let itemUpdateTime = _.get(_item, "metaData.updateTime");
    let itemPrice = _.get(_item, "priceInfo.price");
    let itemUrl = `https://www.tmon.co.kr/deal/${itemUuid}`;

    let targetItem = await Tmon.findOne({ uuid: itemUuid });
    targetItem = JSON.parse(JSON.stringify(targetItem));

    if (_.isEmpty(targetItem)) {
      await Tmon.create({
        name: itemName,
        uuid: itemUuid,
        update_time: itemUpdateTime,
        price: itemPrice,
        url: itemUrl,
      });
      // 신규 알림쏘기
      console.dir({
        name: itemName,
        uuid: itemUuid,
        update_time: itemUpdateTime,
        price: itemPrice,
        url: itemUrl,
      });

      await sendMessage(
        `${itemName}`,
        `[신규등록]\n${itemPrice}원\n${itemUrl}`
      );
    } else if (itemUpdateTime !== _.get(targetItem, "update_time")) {
      //   console.dir({ itemName, itemUuid, itemUpdateTime, itemPrice, itemUrl });
      await Tmon.findOneAndUpdate(
        { uuid: itemUuid },
        {
          name: itemName,
          uuid: itemUuid,
          update_time: itemUpdateTime,
          price: itemPrice,
          url: itemUrl,
        }
      );
      // 정보변경 알림쏘기
      console.dir({
        name: itemName,
        uuid: itemUuid,
        update_time: itemUpdateTime,
        price: itemPrice,
        url: itemUrl,
      });
      await sendMessage(`${itemName}`, `[재등록]\n${itemPrice}원\n${itemUrl}`);
    }
  }
};

module.exports = { voucherDetect };
