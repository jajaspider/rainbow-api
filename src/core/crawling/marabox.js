const axios = require("axios");
const cheerio = require("cheerio");
const _ = require("lodash");
const FormData = require("form-data");
const dayjs = require("dayjs");

const NoticeDB = require("../../models").Notice;
const rabbitmq = require("../rabbitmq");
const { sendMessage } = require("../../services/theMore/telegram.handler");

class Marabox {
  constructor() {}

  async init() {
    this.prefix = "https://marahuyobox.com";

    this.publishTime = new Date().getTime() - 1000 * 60 * 3;
    this.publish = false;
    this.publishCount = 0;
    this.price = 0;
  }

  async crawling() {
    dayjs.locale("ko");
    if (dayjs().hour() < 9) {
      this.publish = false;
      this.publishCount = 0;
      this.price = 0;
      return;
    }
    let response = null;
    try {
      response = await axios.get(`${this.prefix}`);
      let cookies = _.get(response, "headers.set-cookie");
      //   console.dir(requestCookie);

      //   let formData = new FormData();
      //   formData.append("form_type", "storefront_password");
      //   formData.append("utf8", "✓");
      //   formData.append("password", "maravip");
      //   formData.append("commit", "");
      //   response = await axios.post(`${this.prefix}/password`, formData);

      //   let headers = response.headers;
      //   let cookies = _.get(headers, "set-cookie");
      cookies.push(
        "storefront_digest=d63aba7ac7da292c82070079784e85d66a9ad6a46f10e733d3fb4202bcbd379f; path=/; secure; HttpOnly; SameSite=None"
      );
      response = await axios.get(
        `${this.prefix}/products/manila-history-bookn`,
        {
          headers: {
            Cookie: cookies,
          },
        }
      );
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
            url: `비번 : maravip\n${this.prefix}/products/manila-history-bookn`,
            title: "마라탕 재고알림",
            type: "themoreNotice",
          };

          if (_.isNumber(price)) {
            let krwResult = await calculateKRW(
              "PHP",
              price,
              dayjs().format("YYYYMMDD")
            );
            publishObj.url += `\n\n현재가격 : ${price} PHP\n원화가격 : ${krwResult.krwAmount}원`;
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
          stock == "Add to cart" &&
          this.publishCount < 3 &&
          new Date().getTime() - this.publishTime >= 1000 * 60 * 3 &&
          price == this.price
        ) {
          let publishObj = {
            url: `비번 : maravip\n${this.prefix}/products/manila-history-bookn`,
            title: "마라탕 재고알림",
            type: "themoreNotice",
          };

          if (_.isNumber(price)) {
            let krwResult = await calculateKRW(
              "PHP",
              price,
              dayjs().format("YYYYMMDD")
            );
            publishObj.url += `\n\n현재가격 : ${price} PHP\n원화가격 : ${krwResult.krwAmount}원`;
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
            url: `비번 : maravip\n${this.prefix}/products/manila-history-bookn`,
            title: "마라탕 가격변동",
            type: "themoreNotice",
          };

          if (_.isNumber(price)) {
            let krwResult = await calculateKRW(
              "PHP",
              price,
              dayjs().format("YYYYMMDD")
            );
            publishObj.url += `\n\n현재가격 : ${price} PHP\n원화가격 : ${krwResult.krwAmount}원`;
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
            url: `품절`,
            title: "마라탕 재고알림",
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

const marabox = new Marabox();

module.exports = marabox;
