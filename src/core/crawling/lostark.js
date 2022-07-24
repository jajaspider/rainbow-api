const axios = require('axios');
const cheerio = require('cheerio');
const _ = require('lodash');
const rabbitmq = require('../rabbitmq');
const NoticeDB = require('../../models').Notice;

class Lostark {
    constructor() {
        this.notices = [];
    }

    async init() {
        // db 데이터 load하여 this.notices에 넣기
        let notices = await NoticeDB.find({
            'type': 'lostarkNotice'
        }).sort({
            'createdAt': -1
        }).limit(30).lean();

        _.map(notices, (notice) => {
            this.notices.push(_.pick(notice, ['title', 'url', 'type']));
        });
    }

    async crawlingNotice() {
        let urlPrefix = "https://lostark.game.onstove.com";
        let url = `${urlPrefix}/News/Notice/List`;
        let response = await axios.get(url);

        let html = cheerio.load(response.data);
        let notices = html(`#list > div.list.list--default > ul:nth-child(2) > li`);

        for (let notice of notices) {
            notice = cheerio.load(notice);
            let noticeUrl = _.get(notice('a'), '0.attribs.href').split("?")[0];
            let noticeTitle = notice('a > div.list__subject > span').text().replace(/\n/g, '').replace('새 글', '').replace(/ +/g, " ").trim();
            let noticeObj = {
                url: `${urlPrefix}${noticeUrl}`,
                title: noticeTitle,
                type: 'lostarkNotice'
            };

            if (!_.find(this.notices, noticeObj)) {
                console.dir(noticeObj);
                this.notices.push(noticeObj);
                // db에 공지데이터 넣기
                await NoticeDB.create(noticeObj);
                // mq send
                await rabbitmq.assertQueue('notice.lostark');
                await rabbitmq.bindQueue('notice.lostark', rabbitmq.mqConfig.exchange, 'notice');
                await rabbitmq.sendToQueue('notice.lostark', noticeObj);
            }
        }
    }
}

const lostark = new Lostark();

module.exports = lostark;