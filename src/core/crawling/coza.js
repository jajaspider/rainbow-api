const axios = require("axios");
const cheerio = require("cheerio");
const _ = require("lodash");
const rabbitmq = require("../rabbitmq");

class Coza {
  constructor() {}

  async init() {
    this.targetUrl =
      "https://www.daisyshop.co.za/products/south-korea-tour-consulting-pin";

    this.publishTime = new Date().getTime() - 1000 * 60 * 5;
  }

  async crawling() {
    try {
      let response = await axios.get(this.targetUrl);
      let html = cheerio.load(response.data);
      let stock = html(`.product-form__buttons`);
      stock = stock.text();
      stock = stock.replace(/\n/g, "");
      stock = stock.trim();

      if (stock == "Add to cart") {
        if (new Date().getTime() - this.publishTime >= 1000 * 60 * 5) {
          let publishObj = {
            url: this.targetUrl,
            title: "[coza 재고알림]",
            type: "themoreNotice",
          };
          console.dir(publishObj);
          await rabbitmq.assertQueue("notice.themore");
          await rabbitmq.bindQueue(
            "notice.themore",
            rabbitmq.mqConfig.exchange,
            "notice"
          );
          await rabbitmq.sendToQueue("notice.themore", publishObj);
          this.publishTime = new Date().getTime();
        }
      }
    } catch (e) {
      console.dir(e);
    }
  }
}

const coza = new Coza();

module.exports = coza;
