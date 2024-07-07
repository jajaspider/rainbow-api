const _ = require("lodash");
const axios = require("axios");
const qs = require("querystring");

const Wemakeprice = require("../../models").Wemakeprice;
const { sendMessage } = require("../../services/theMore/telegram.handler");
const rabbitmq = require("../rabbitmq");

class WEMAKEPRICE {
  constructor() {
    this.vouchers = [];
  }

  async init() {
    const wemakeprice = await Wemakeprice.find({});
    this.vouchers = JSON.parse(JSON.stringify(wemakeprice));
    this.url = `https://front.wemakeprice.com/api/listingsearch/v1.2/deal/list.json?os=pc&apiVersion=1.2&domain=listingsearch-api.wemakeprice.com&path=%2Fv1.2%2Fdeal%2Flist&categoryId=2100239&perPage=100`;
  }

  async sendNotice(title, text) {
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

  async requestPagenationQuery(url) {
    let result = [];
    const response = await axios.get(url);

    const responseData = _.get(response, "data.data");

    const pagination = _.get(responseData, "pagination");
    console.dir(pagination);

    const items = _.get(responseData, "deals");
    result = _.concat(result, items);

    const nextUrl = _.get(pagination, "nextUrl");
    if (nextUrl !== null) {
      let recursiveResponse = await requestPagenationQuery(nextUrl);
      result = _.concat(result, recursiveResponse);
    }

    return result;
  }

  async voucherDetect() {
    try {
      let items = await this.requestPagenationQuery(this.url);

      for (let _item of items) {
        let itemName = _.get(_item, "dispNm", "상품명");
        let itemUuid = _.get(_item, "link.value");
        let itemPrice =
          _.get(_item, "discountPrice") ||
          _.get(_item, "salePrice") ||
          _.get(_item, "originPrice");
        // itemUuid = parseInt(itemUuid);
        let itemUrl = `https://front.wemakeprice.com/product/${itemUuid}`;

        let targetVoucher = _.find(this.vouchers, { uuid: itemUuid });
        // 바우처가 없는데 리스트에 생김 -> 신규 등록
        if (_.isEmpty(targetVoucher)) {
          console.dir({ uuid: itemUuid, targetVoucher, _item });
          await Wemakeprice.create({
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
            await Wemakeprice.findOneAndUpdate(
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
        const targetActiveVoucher = _.find(
          items,
          _.matchesProperty("link.value", _activeVoucher.uuid)
        );

        if (_.isEmpty(targetActiveVoucher)) {
          // 만약 현재 active 바우처에서 찾지못한다면
          await Wemakeprice.findOneAndUpdate(
            { uuid: _activeVoucher.uuid },
            { isActive: false }
          );

          // await this.sendNotice(
          //   _activeVoucher.name,
          //   `[종료]\n${_activeVoucher.url}`
          // );
        }
      }

      this.vouchers = await Wemakeprice.find({});
    } catch (e) {
      //
    }
  }
}

const wemakeprice = new WEMAKEPRICE();
module.exports = wemakeprice;
