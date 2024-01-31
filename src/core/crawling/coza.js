const axios = require("axios");
const cheerio = require("cheerio");
const _ = require("lodash");
const rabbitmq = require("../rabbitmq");
const NoticeDB = require("../../models").Notice;

class Coza {
  constructor() {}

  async init() {
    this.targetUrl =
      "https://www.daisyshop.co.za/products/south-korea-tour-consulting-pin";
    // this.targetUrl =
    //   "https://www.daisyshop.co.za/products/apple-bubble-tea-6-pack";

    this.publishTime = new Date().getTime() - 1000 * 60 * 3;
    this.publish = false;
    this.publishCount = 0;
  }

  async crawling() {
    try {
      let response = await axios.get(this.targetUrl);
      let html = cheerio.load(response.data);
      let stock = html(`.product-form__buttons`);
      stock = stock.text();
      stock = stock.replace(/\n/g, "");
      stock = stock.trim();
      console.dir({ component: "coza", stock });

      // 공지를 보내는중이 아니고
      if (this.publish == false) {
        // 재고가 들어왔다면
        if (stock == "Add to cart") {
          let publishObj = {
            url: this.targetUrl,
            title: "[coza 재고알림]",
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
          this.publishTime = new Date().getTime();
          this.publishCount += 1;
          this.publish = true;
        }
      }
      // 공지를 보내는중이였고
      else {
        // 재고가 들어왔고, 전송횟수가 3회 미만이며, 전송시간이 3분 지난경우
        if (
          stock == "Add to cart" &&
          this.publishCount < 3 &&
          new Date().getTime() - this.publishTime >= 1000 * 60 * 3
        ) {
          let publishObj = {
            url: this.targetUrl,
            title: "[coza 재고알림]",
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
          this.publishTime = new Date().getTime();
          this.publishCount += 1;
        }
        //공지를 보내던 중 품절이 발생
        else if (stock == "Sold out") {
          let publishObj = {
            url: "품절",
            title: "[coza 재고알림]",
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
          this.publishTime = new Date().getTime();
          this.publishCount = 0;
          this.publish = false;
        } else {
          console.dir({
            func: "debug",
            stock,
          });
        }
      }
    } catch (e) {
      console.dir(e);
    }
  }
}

const coza = new Coza();

module.exports = coza;
