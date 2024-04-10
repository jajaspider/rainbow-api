const axios = require("axios");
const cheerio = require("cheerio");
const _ = require("lodash");
const dayjs = require("dayjs");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");

dayjs.extend(utc);
dayjs.extend(timezone);

const NoticeDB = require("../../models").Notice;
const rabbitmq = require("../rabbitmq");
const { sendMessage } = require("../../services/theMore/telegram.handler");
const { calculateKRW } = require("../../services/theMore");

class Soul {
  constructor() {}

  async init() {
    this.targetUrl =
      // "https://www.soulessleft.com/products/iphone-15-charger-fast-charging,-mfi-certified-2-pack-10ft-long-usb-c-fast-charging-cable-and-20w-type-c-wall-charger,-suitable-for-iphone-1515-plus-15-pro-max,-ipad-pro-1291-1,-ipad-air-45,-ipad-mini-6";
      "https://www.soulessleft.com/products/韩国图书booknlife5000";

    this.publishTime = new Date().getTime() - 1000 * 60 * 3;
    this.publish = false;
    this.publishCount = 0;
    this.price = 0;
    this.koreanTime = dayjs().tz("Asia/Seoul");
  }

  async crawling() {
    console.dir({
      func: "soul",
      hour: this.koreanTime.hour(),
    });
    if (this.koreanTime.hour() < 9) {
      this.publish = false;
      this.publishCount = 0;
      this.price = 0;
      return;
    }

    let response = null;
    try {
      response = await axios.get(encodeURI(this.targetUrl));
      // console.dir(response);
      let html = cheerio.load(response.data);
      let stock = html(`#buynow_button`);
      let isSoldOut = html(
        `#goods_form > div.detail_actions.horizontal_type.detail_button_box > input`
      );
      stock = stock.text();
      isSoldOut = isSoldOut.attr("value");

      let price = html(`#cur_price`);
      price = price.text();
      price = price.replace(/[^0-9.]/g, "");
      price = Number(price);

      // 공지를 보내는중이 아니고
      if (this.publish == false) {
        // 재고가 들어왔다면
        if (stock == "BUY NOW") {
          let publishObj = {
            url: `${this.targetUrl}`,
            title: "코프2 재고알림",
            type: "themoreNotice",
          };

          if (_.isNumber(price)) {
            let krwResult = await calculateKRW(
              "USD",
              price,
              this.koreanTime.format("YYYYMMDD")
            );
            publishObj.url += `\n\n현재가격 : ${price} USD\n원화가격 : ${krwResult.krwAmount}원`;
            this.price = price;
          }

          console.dir(publishObj);
          // db에 공지데이터 넣기
          await NoticeDB.create(publishObj);
          await rabbitmq.assertQueue("notice.themore");
          await rabbitmq.bindQueue(
            "notice.themore",
            rabbitmq.mqConfig.exchange,
            "notice"
          );
          await rabbitmq.sendToQueue("notice.themore", publishObj);
          await sendMessage(publishObj.title, publishObj.url);
          this.publishTime = new Date().getTime();
          this.publishCount += 1;
          this.publish = true;
        }
      }
      // 공지를 보내는중이였고
      else {
        // 재고가 들어왔고, 전송횟수가 3회 미만이며, 전송시간이 3분 지난경우
        if (
          stock == "BUY NOW" &&
          this.publishCount < 3 &&
          new Date().getTime() - this.publishTime >= 1000 * 60 * 3 &&
          price == this.price
        ) {
          let publishObj = {
            url: `${this.targetUrl}`,
            title: "코프2 재고알림",
            type: "themoreNotice",
          };

          if (_.isNumber(price)) {
            let krwResult = await calculateKRW(
              "USD",
              price,
              this.koreanTime.format("YYYYMMDD")
            );
            publishObj.url += `\n\n현재가격 : ${price} USD\n원화가격 : ${krwResult.krwAmount}원`;
            this.price = price;
          }

          console.dir(publishObj);
          // db에 공지데이터 넣기
          await NoticeDB.create(publishObj);
          await rabbitmq.assertQueue("notice.themore");
          await rabbitmq.bindQueue(
            "notice.themore",
            rabbitmq.mqConfig.exchange,
            "notice"
          );
          await rabbitmq.sendToQueue("notice.themore", publishObj);
          await sendMessage(publishObj.title, publishObj.url);
          this.publishTime = new Date().getTime();
          this.publishCount += 1;
        } else if (stock == "Add to cart" && price != this.price) {
          let publishObj = {
            url: `${this.targetUrl}`,
            title: "코프2 가격변동",
            type: "themoreNotice",
          };

          if (_.isNumber(price)) {
            let krwResult = await calculateKRW(
              "USD",
              price,
              this.koreanTime.format("YYYYMMDD")
            );
            publishObj.url += `\n\n현재가격 : ${price} USD\n원화가격 : ${krwResult.krwAmount}원`;
            this.price = price;
          }

          console.dir(publishObj);
          // db에 공지데이터 넣기
          await NoticeDB.create(publishObj);
          await rabbitmq.assertQueue("notice.themore");
          await rabbitmq.bindQueue(
            "notice.themore",
            rabbitmq.mqConfig.exchange,
            "notice"
          );
          await rabbitmq.sendToQueue("notice.themore", publishObj);
          await sendMessage(publishObj.title, publishObj.url);
          this.publishTime = new Date().getTime();
          this.publishCount = 1;
        }
        //공지를 보내던 중 품절이 발생
        else if (isSoldOut == "Sold Out") {
          let publishObj = {
            url: `품절`,
            title: "코프2 재고알림",
            type: "themoreNotice",
          };
          console.dir(publishObj);
          // db에 공지데이터 넣기
          await NoticeDB.create(publishObj);
          await rabbitmq.assertQueue("notice.themore");
          await rabbitmq.bindQueue(
            "notice.themore",
            rabbitmq.mqConfig.exchange,
            "notice"
          );
          await rabbitmq.sendToQueue("notice.themore", publishObj);
          await sendMessage(publishObj.title, publishObj.url);
          this.publishTime = new Date().getTime();
          this.publishCount = 0;
          this.publish = false;
          this.price = 0;
        }
      }
    } catch (e) {
      console.dir(e);
    }
  }
}

const soul = new Soul();

module.exports = soul;
