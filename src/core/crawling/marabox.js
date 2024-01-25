const axios = require("axios");
const cheerio = require("cheerio");
const _ = require("lodash");
const FormData = require("form-data");

const rabbitmq = require("../rabbitmq");

class Marabox {
  constructor() {}

  async init() {
    this.prefix = "https://marahuyobox.com";

    this.publishTime = new Date().getTime() - 1000 * 60 * 5;
  }

  async crawling() {
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
      if (stock == "Add to cart") {
        if (new Date().getTime() - this.publishTime >= 1000 * 60 * 5) {
          let publishObj = {
            url: `${this.prefix}/products/manila-history-bookn`,
            title: "[마라탕 재고알림]\n비번 : maravip",
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

const marabox = new Marabox();

module.exports = marabox;
