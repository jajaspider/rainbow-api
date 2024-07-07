const _ = require("lodash");
const axios = require("axios");
const qs = require("querystring");

const Tmon = require("../../models").Tmon;
const { sendMessage } = require("../../services/theMore/telegram.handler");
const rabbitmq = require("../rabbitmq");

class TMON {
  constructor() {
    this.vouchers = [];
  }

  async init() {
    const tmon = await Tmon.find({});
    this.vouchers = JSON.parse(JSON.stringify(tmon));
    this.url = `https://www.tmon.co.kr/api/direct/v1/categorylistapi/api/strategy/filter/80020000/deals`;
    this.query = {
      size: 100,
      page: 0,
      sortType: "POPULAR",
      platform: "PC_WEB",
    };
  }

  async sendNotice(title, text) {
    // console.dir({ type: "console 메세지", title, text });
    await sendMessage(text);
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
  }

  async requestPagenationQuery(url, query) {
    let result = [];
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
  }

  async voucherDetect() {
    // const url = `https://www.tmon.co.kr/api/direct/v1/categorylistapi/api/strategy/filter/80020000/deals`;

    try {
      let items = await this.requestPagenationQuery(this.url, this.query);
      for (let _item of items) {
        let itemName = _.get(_item, "titleName", "상품명");
        let itemUuid = _.get(_item, "dealNo");
        let itemPrice = _.get(_item, "priceInfo.price");
        let itemUrl = `https://www.tmon.co.kr/deal/${itemUuid}`;

        let targetVoucher = _.find(this.vouchers, { uuid: itemUuid });
        // 바우처가 없는데 리스트에 생김 -> 신규 등록
        if (_.isEmpty(targetVoucher)) {
          await Tmon.create({
            name: itemName,
            uuid: itemUuid,
            price: itemPrice,
            url: itemUrl,
            isActive: true,
          });
          // 신규 알림쏘기
          console.dir({
            name: itemName,
            uuid: itemUuid,
            price: itemPrice,
            url: itemUrl,
          });
          await this.sendNotice(
            itemName,
            `[신규등록]\n${itemPrice}원\n${itemUrl}`
          );
        }
        // 바우처가 있을때
        else {
          // 재등록 됨
          if (!_.get(targetVoucher, "isActive")) {
            await Tmon.findOneAndUpdate(
              { uuid: itemUuid },
              {
                name: itemName,
                uuid: itemUuid,
                price: itemPrice,
                url: itemUrl,
                isActive: true,
              }
            );
            // 정보변경 알림쏘기
            console.dir({
              name: itemName,
              uuid: itemUuid,
              price: itemPrice,
              url: itemUrl,
            });
            await this.sendNotice(
              itemName,
              `[재등록]\n${itemPrice}원\n${itemUrl}`
            );
          }
        }
      }

      let activeVouchers = _.filter(this.vouchers, { isActive: true });

      for (const _activeVoucher of activeVouchers) {
        const targetActiveVoucher = _.find(items, {
          dealNo: _activeVoucher.uuid,
        });

        if (_.isEmpty(targetActiveVoucher)) {
          // 만약 현재 active 바우처에서 찾지못한다면
          await Tmon.findOneAndUpdate(
            { uuid: _activeVoucher.uuid },
            { isActive: false }
          );

          // await this.sendNotice(
          //   _activeVoucher.name,
          //   `[종료]\n${_activeVoucher.url}`
          // );
        }
      }

      this.vouchers = await Tmon.find({});
    } catch (e) {
      //
    }
  }
}

const tmon = new TMON();
module.exports = tmon;
