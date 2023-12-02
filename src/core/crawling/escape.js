const axios = require('axios');
const cheerio = require('cheerio');
const _ = require('lodash');
const rabbitmq = require('../rabbitmq');
const NoticeDB = require('../../models').Notice;

class Escape {
    constructor() {
        this.notices = [];
    }

    async init() {
        // db 데이터 load하여 this.notices에 넣기
        let notices = await NoticeDB.find({
            'type': 'escapeNotice'
        }).sort({
            'createdAt': -1
        }).limit(30).lean();

        _.map(notices, (notice) => {
            this.notices.push(_.pick(notice, ['title', 'url', 'type']));
        });
    }

    async crawlingNotice() {
        let subject = '열쇠공의 이중생활';
        let urlPrefix = "https://point-nine.com/layout/res/";
        let url = `${urlPrefix}home.php?rev_days=2023-12-09&s_zizum=1&go=rev.make`;
        let response = await axios.get(url);

        let html = cheerio.load(response.data);
        let notices = html(`#contents > div > div > div:nth-child(5) > div.time_Area > ul > li`);

        for (let notice of notices) {
            notice = cheerio.load(notice);
            let noticeUrl = _.get(notice('a'), '0.attribs.href');
            if (_.isEmpty(noticeUrl)) {
                continue
            };

            let escapeTime = notice('a > span.time').text().trim();
            let noticeObj = {
                url: `${urlPrefix}${noticeUrl}`,
                title: `${subject} ${escapeTime} 예약오픈`,
                type: 'escapeNotice'
            };

            if (!_.find(this.notices, noticeObj)) {
                console.dir(noticeObj);
                this.notices.push(noticeObj);
                // db에 공지데이터 넣기
                await NoticeDB.create(noticeObj);
                // mq send
                await rabbitmq.assertQueue('notice.escape');
                await rabbitmq.bindQueue('notice.escape', rabbitmq.mqConfig.exchange, 'notice');
                await rabbitmq.sendToQueue('notice.escape', noticeObj);
            }
        }

    }
}

const escape = new Escape();

module.exports = escape;