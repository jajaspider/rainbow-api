const axios = require("axios");
const cheerio = require("cheerio");
const _ = require("lodash");
const iconv = require("iconv-lite");

const rabbitmq = require("../rabbitmq");
const NoticeDB = require("../../models").Notice;

class PpomppuNaver {
  constructor() {
    this.notices = [];
    this.testNotices = [];
  }

  async init() {
    // db 데이터 load하여 this.notices에 넣기
    let notices = await NoticeDB.find({
      type: "financialNotice",
    })
      .sort({
        createdAt: -1,
      })
      .limit(30)
      .lean();
    let testNotices = await NoticeDB.find({
      type: "financialNotice",
    })
      .sort({
        createdAt: -1,
      })
      .limit(30)
      .lean();

    _.map(notices, (notice) => {
      this.notices.push(_.pick(notice, ["title", "url", "type"]));
    });

    _.map(testNotices, (testNotice) => {
      this.testNotices.push(_.pick(testNotice, ["title", "url", "type"]));
    });
  }

  async crawlingNotice() {
    let notices = [];

    const ppomppuUrl = `https://www.ppomppu.co.kr/zboard`;

    let result = await axios.get(`${ppomppuUrl}/zboard.php?id=coupon`, {
      responseType: "arraybuffer",
    });
    result = iconv.decode(result.data, "EUC-KR").toString();

    let html = cheerio.load(result);

    const trs = html(
      `#revolution_main_table > tbody > tr > td.baseList-space.title > a`
    );

    for (const index of _.keys(trs)) {
      const url = _.get(trs[index], "attribs.href");

      if (_.get(trs[index], "children.0.children.0.type") === "tag") {
        const tag = _.get(trs[index], "children.0.children.0.children.0.data");
        if (tag === "[네이버페이]") {
          const title = _.get(trs[index], "children.0.children.1.data");
          notices.push({
            url: `${ppomppuUrl}/${url}`,
            title: `${tag} ${title}`,
            type: "financialNotice",
          });
        }
      }
    }

    for (let notice of notices) {
      if (!_.find(this.notices, notice)) {
        console.dir(notice);
        this.notices.push(notice);
        // db에 공지데이터 넣기
        await NoticeDB.create(notice);
        // mq send
        await rabbitmq.assertQueue("notice.financial");
        await rabbitmq.bindQueue(
          "notice.financial",
          rabbitmq.mqConfig.exchange,
          "notice"
        );
        await rabbitmq.sendToQueue("notice.financial", notice);
      }
    }
  }
}

const ppomppuNaver = new PpomppuNaver();
module.exports = ppomppuNaver;
