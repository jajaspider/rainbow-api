const axios = require("axios");
const cheerio = require("cheerio");
const _ = require("lodash");
const dayjs = require("dayjs");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");

dayjs.extend(utc);
dayjs.extend(timezone);

const rabbitmq = require("../rabbitmq");
const NoticeDB = require("../../models").Notice;
const { sendMessage } = require("../../services/theMore/telegram.handler");

class Julingo3 {
  constructor() {}

  async init() {
    this.targetUrl =
      "https://templatebestworld.com/products/korea-birthday-gift-item-happy-tshirts";

    this.publishTime = new Date().getTime() - 1000 * 60 * 3;
    this.publish = false;
    this.publishCount = 0;
    this.price = 0;
    this.koreanTime = dayjs().tz("Asia/Seoul");
  }

  async crawling() {
    if (this.koreanTime.hour() < 9) {
      this.publish = false;
      this.publishCount = 0;
      this.price = 0;
      return;
    }
    try {
      let response = await axios.get(this.targetUrl);
      let html = cheerio.load(response.data);
      let stock = html(`.product-form__buttons`);
      stock = stock.text();
      stock = stock.replace(/\n/g, "");
      stock = stock.trim();

      let price = html(`.price__regular`);
      price = price.text();
      price = price.replace(/[^0-9.]/g, "");
      price = Number(price);

      // 공지를 보내는중이 아니고
      if (this.publish == false) {
        // 재고가 들어왔다면
        if (stock == "Add to cart") {
          let publishObj = {
            url: this.targetUrl,
            title: "줄링3 재고알림",
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
        // 재고가 들어왔고, 전송횟수가 3회 미만이며, 전송시간이 3분 지난경우, 또한 가격이 같은 경우
        if (
          stock == "Add to cart" &&
          this.publishCount < 3 &&
          new Date().getTime() - this.publishTime >= 1000 * 60 * 3 &&
          price == this.price
        ) {
          let publishObj = {
            url: this.targetUrl,
            title: "줄링3 재고알림",
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
            url: this.targetUrl,
            title: "줄링3 가격변동",
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
        else if (stock == "Sold out") {
          let publishObj = {
            url: "품절",
            title: "줄링3 재고알림",
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

const julingo3 = new Julingo3();

module.exports = julingo3;
