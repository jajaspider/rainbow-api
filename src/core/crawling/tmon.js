const _ = require("lodash");
const axios = require("axios");
const qs = require("querystring");

const Tmon = require("../../models").Tmon;
const { sendMessage } = require("../../services/theMore/telegram.handler");
const rabbitmq = require("../rabbitmq");

/*
ssg상품권
교통페이상품권
롯데백화점
올영
이마트
홈플
*/
class TMON {
  constructor() {
    this.vouchers = [];
    this.whiteList = [
      "컬쳐랜드",
      "Google Play",
      "L.POINT",
      "엘포인트",
      "국민관광상품권",
      "롯데모바일상품권",
      "H.Point",
      "현대백화점",
      "머니트리",
      "배달의민족",
      "센골드",
      "신세계백화점",
      "신세계상품권",
      "요기요 상품권",
      "티몬캐시",
      "[PAYCO]",
      "북앤라이프",
      "도서문화",
      "온라인문화상품권",
      "온라인 문화상품권",
      "컬쳐랜드 상품권",
      "해피머니",
      "[문화상품권]",
    ];
  }

  async init() {
    const tmon = await Tmon.find({});
    this.vouchers = JSON.parse(JSON.stringify(tmon));
    this.url = `https://www.tmon.co.kr/api/direct/v1/categorylistapi/api/strategy/filter/68000000/deals`;
    this.query = {
      size: 1000,
      page: 0,
      sortType: "POPULAR",
      platform: "PC_WEB",
    };

    this.promotionUrl = `https://www.tmon.co.kr/api/direct/v1/categorylistapi/api/strategy/filter/80020000/deals`;
    this.promotionQuery = {
      size: 1000,
      page: 0,
      sortType: "POPULAR",
      platform: "PC_WEB",
    };
  }

  isWhiteList(voucherName, whiteList) {
    for (const _whiteList of whiteList) {
      if (voucherName.includes(_whiteList)) {
        return true;
      }
    }
    return false;
  }

  async sendNotice(title, text) {
    // console.dir({ type: "console 메세지", title, text });
    try {
      await sendMessage(text);
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
      let recursiveResponse = await this.requestPagenationQuery(url, query);
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
      let title = i;
      let text = "";
      _.map(result[i], (obj) => {
        if (obj.type === "refresh") {
          text += `\n[재등록] ${obj.price}원 ${obj.url}`;
        }
      });
      await this.sendNotice(title, text);
    }
  }

  async voucherDetect() {
    let noticeObj = [];
    // const url = `https://www.tmon.co.kr/api/direct/v1/categorylistapi/api/strategy/filter/80020000/deals`;

    try {
      let items = await this.requestPagenationQuery(
        this.url,
        _.cloneDeep(this.query)
      );
      let promotionItems = await this.requestPagenationQuery(
        this.promotionUrl,
        _.cloneDeep(this.promotionQuery)
      );

      // e쿠폰 + 프로모션 상품권
      items = _.concat(items, promotionItems);
      // 중복제거
      items = _.uniqBy(items, "dealNo");
      // 화이트리스트가 아니라면 제거
      items = _.filter(items, (item) =>
        this.isWhiteList(_.get(item, "titleName").trim(), this.whiteList)
      );

      for (let _item of items) {
        let itemName = _.get(_item, "titleName", "상품명").trim();

        let itemUuid = _.get(_item, "dealNo");
        let itemPrice = _.get(_item, "priceInfo.price");
        let itemUrl = `https://www.tmon.co.kr/deal/${itemUuid}`;
        let dealMax = _.get(_item, "dealMax.stockCount");
        // 재고가 25개 미만이라면 알림과 연관없음
        if (dealMax < 25) {
          continue;
        }

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
            type: "신규 알림",
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
              type: "정보 변경",
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
        }
      }

      let activeVouchers = _.filter(this.vouchers, { isActive: true });

      for (const _activeVoucher of activeVouchers) {
        const targetActiveVoucher = _.find(
          items,
          _.matchesProperty("dealNo", _activeVoucher.uuid)
        );

        if (_.isEmpty(targetActiveVoucher)) {
          // 만약 현재 active 바우처에서 찾지못한다면
          await Tmon.findOneAndUpdate(
            { uuid: _activeVoucher.uuid },
            { isActive: false }
          );
        }
      }

      const tmon = await Tmon.find({});
      this.vouchers = JSON.parse(JSON.stringify(tmon));
    } catch (e) {
      //
      console.dir(e);
    }

    try {
      await this.noticeByName(noticeObj);
    } catch (e) {
      //
    }
  }
}

const tmon = new TMON();
module.exports = tmon;
