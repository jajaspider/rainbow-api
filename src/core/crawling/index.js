require("./shinhan");

const maplestory = require("./maplestory");
const lostark = require("./lostark");
const happymbook = require("./happymbook");

class Crawling {
  constructor() {}
  async init() {
    await maplestory.init();
    await lostark.init();
    await happymbook.init();

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
  }
}

const crawling = new Crawling();
crawling.init();

module.exports = crawling;
