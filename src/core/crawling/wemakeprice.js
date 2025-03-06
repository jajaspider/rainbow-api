const _ = require("lodash");
const axios = require("axios");

const Wemakeprice = require("../../models").Wemakeprice;
const voucherService = require("../../services/voucher.service");
const { WHITE_LIST } = require("../constants");

class WEMAKEPRICE {
  constructor() {
    this.vouchers = [];
  }

  async init() {
    const wemakeprice = await Wemakeprice.find({});
    this.vouchers = JSON.parse(JSON.stringify(wemakeprice));
    this.voucherUrl = `https://front.wemakeprice.com/api/listingsearch/v1.2/deal/list.json?os=pc&apiVersion=1.2&domain=listingsearch-api.wemakeprice.com&path=%2Fv1.2%2Fdeal%2Flist&categoryId=2100239&perPage=100`;
    this.cultureUrl = `https://front.wemakeprice.com/api/listingsearch/v1.2/deal/list.json?os=pc&apiVersion=1.2&domain=listingsearch-api.wemakeprice.com&path=%2Fv1.2%2Fdeal%2Flist&categoryId=2100618&perPage=100`;
  }

  isWhiteList(voucherName) {
    for (const _whiteList of WHITE_LIST) {
      if (voucherName.includes(_whiteList)) {
        return true;
      }
    }
    return false;
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

  async noticeByName(noticeArray) {
    let result = noticeArray.reduce((result, item) => {
      const key = item.name;

      if (!result[key]) {
        result[key] = [];
      }

      // item을 해당 키의 배열에 추가
      result[key].push(item);

      return result;
    }, {});

    for (const i of _.keys(result)) {
      let title = `#위메프 ${i}`;
      let text = "";
      _.map(result[i], (obj) => {
        if (obj.type === "refresh") {
          text += `\n[재등록] ${obj.price}원\n${obj.url}`;
        } else if (obj.type === "new") {
          text += `\n[신규등록] ${obj.price}원\n${obj.url}`;
        } else if (obj.type === "price") {
          text += `\n[가격변동] ${obj.price}원\n${obj.url}`;
        } else if (obj.type === "soldout") {
          text += `\n[종료] ${obj.price}원\n${obj.url}`;
        }
      });
      await voucherService.sendNotice(title, text);
      // await this.sendNotice(title, text);
    }
  }

  async voucherDetect() {
    let noticeObj = [];

    try {
      let voucherItems = await this.requestPagenationQuery(this.voucherUrl);
      let cultureItems = await this.requestPagenationQuery(this.cultureUrl);

      let items = _.concat(voucherItems, cultureItems);
      items = _.uniqBy(items, "linkInfo");

      items = _.filter(items, (item) =>
        this.isWhiteList(_.get(item, "dispNm").trim())
      );

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
          // console.dir({ uuid: itemUuid, targetVoucher, _item });
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

          noticeObj.push({
            name: itemName,
            uuid: itemUuid,
            type: "new",
            price: itemPrice,
            url: itemUrl,
          });
        }
        // 바우처가 있을때
        else {
          // 재등록 됨
          if (_.get(targetVoucher, "isActive") === false) {
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

            noticeObj.push({
              name: itemName,
              uuid: itemUuid,
              type: "refresh",
              price: itemPrice,
              url: itemUrl,
            });
          }
          // 가격변동
          else if (_.get(targetVoucher, "price") !== itemPrice) {
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
            // 가격변동 알림쏘기
            console.dir({
              name: itemName,
              uuid: itemUuid,
              price: itemPrice,
              url: itemUrl,
            });

            noticeObj.push({
              name: itemName,
              uuid: itemUuid,
              type: "price",
              price: itemPrice,
              url: itemUrl,
            });
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

          noticeObj.push({
            name: _activeVoucher.name,
            uuid: _activeVoucher.uuid,
            type: "soldout",
            price: _activeVoucher.price,
            url: _activeVoucher.url,
          });
        }
      }

      const wemakeprice = await Wemakeprice.find({});
      this.vouchers = JSON.parse(JSON.stringify(wemakeprice));
    } catch (e) {
      //
    }

    try {
      await this.noticeByName(noticeObj);
    } catch (e) {
      //
    }
  }
}

const wemakeprice = new WEMAKEPRICE();
module.exports = wemakeprice;
