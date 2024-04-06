require("./shinhan");
require("./qoo10");

const maplestory = require("./maplestory");
const lostark = require("./lostark");
const happymbook = require("./happymbook");
const coza = require("./coza");
const marabox = require("./marabox");
const horizon = require("./horizon");
const julingo3 = require("./julingo3");
const tbtro = require('./tbtro');
const ncncCheckStatus = require("./ncnc");

class Crawling {
  constructor() {}
  async init() {
    await maplestory.init();
    await lostark.init();
    await happymbook.init();
    await coza.init();
    await marabox.init();
    await horizon.init();
    await julingo3.init();
    await tbtro.init();

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
    }, 10000);

    this.cozaNotice = setInterval(async () => {
      await coza.crawling();
    }, 10000);

    this.maraboxNotice = setInterval(async () => {
      await marabox.crawling();
    }, 20000);

    this.horizonNotice = setInterval(async () => {
      await horizon.crawling();
    }, 10000);

    this.julingo3Notice = setInterval(async () => {
      await julingo3.crawling();
    }, 10000);

    this.tbtroNotice = setInterval(async () => {
      await tbtro.crawling();
    }, 10000);

    setInterval(async () => {
      await ncncCheckStatus();
    }, 60000);
  }
}

const crawling = new Crawling();
crawling.init();

module.exports = crawling;
