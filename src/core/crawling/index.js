require("./shinhan");

const maplestory = require("./maplestory");
const lostark = require("./lostark");
const happymbook = require("./happymbook");
const coza = require("./coza");
const marabox = require("./marabox");

class Crawling {
  constructor() {}
  async init() {
    await maplestory.init();
    await lostark.init();
    await happymbook.init();
    await coza.init();
    await marabox.init();

    this.maplestoryNotice = setInterval(async () => {
      await maplestory.crawlingNotice();
    }, 5000);
    this.maplestoryTestNotice = setInterval(async () => {
      await maplestory.crawlingTestNotice();
    }, 5000);

    this.lostarkNotice = setInterval(async () => {
      await lostark.crawlingNotice();
    }, 5000);

    this.happymbookNotice = setInterval(async () => {
      await happymbook.crawling();
    }, 5000);

    this.cozaNotice = setInterval(async () => {
      await coza.crawling();
    }, 5000);

    this.maraboxNotice = setInterval(async () => {
      await marabox.crawling();
    }, 10000);
  }
}

const crawling = new Crawling();
crawling.init();

module.exports = crawling;
