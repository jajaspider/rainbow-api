const axios = require('axios');
const cheerio = require('cheerio');
const _ = require('lodash');
const rabbitmq = require('../rabbitmq');
const NoticeDB = require('../../models').Notice;

class Maplestory {
    constructor() {
        this.notices = [];
        this.testNotices = [];
    }

    async init() {
        // db 데이터 load하여 this.notices에 넣기
        let notices = await NoticeDB.find({
            'type': 'maplestoryNotice'
        }).sort({
            'createdAt': -1
        }).limit(15).lean();
        let testNotices = await NoticeDB.find({
            'type': 'maplestoryTestNotice'
        }).sort({
            'createdAt': -1
        }).limit(15).lean();

        _.map(notices, (notice) => {
            this.notices.push(_.pick(notice, ['title', 'url', 'type']));
        });

        _.map(testNotices, (testNotice) => {
            this.testNotices.push(_.pick(testNotice, ['title', 'url', 'type']));
        });
    }

    async crawlingNotice() {
        let urlPrefix = "https://maplestory.nexon.com";
        let url = `${urlPrefix}/News/Notice`;
        let response = await axios.get(url);

        let html = cheerio.load(response.data);
        let notices = html(`#container > div > div.contents_wrap > div.news_board > ul > li`);
        // console.dir(notices);
        for (let notice of notices) {
            notice = cheerio.load(notice);
            let noticeUrl = _.get(notice('p > a'), '0.attribs.href');
            let noticeTitle = notice('p > a > span').text().replace(/\n/g, '').replace(/ +/g, " ").trim();
            let noticeObj = {
                url: `${urlPrefix}${noticeUrl}`,
                title: noticeTitle,
                type: 'maplestoryNotice'
            };

            if (!_.find(this.notices, noticeObj)) {
                console.dir(noticeObj);
                this.notices.push(noticeObj);
                // db에 공지데이터 넣기
                await NoticeDB.create(noticeObj);
                // mq send
                await rabbitmq.assertQueue('notice.maplestory');
                await rabbitmq.bindQueue('notice.maplestory', rabbitmq.mqConfig.exchange, 'notice');
                await rabbitmq.sendToQueue('notice.maplestory', noticeObj);
            }
        }
    }

    async crawlingTestNotice() {
        let urlPrefix = "https://maplestory.nexon.com";
        let url = `${urlPrefix}/Testworld/Totalnotice`;
        let response = await axios.get(url);

        let html = cheerio.load(response.data);
        let notices = html(`#container > div > div.contents_wrap > div.news_board > ul > li`);
        // console.dir(notices);
        for (let notice of notices) {
            notice = cheerio.load(notice);
            let noticeUrl = _.get(notice('p > a'), '0.attribs.href');
            let noticeTitle = notice('p > a > span').text().replace(/\n/g, '').replace(/ +/g, " ").trim();
            let noticeObj = {
                url: `${urlPrefix}${noticeUrl}`,
                title: noticeTitle,
                type: 'maplestoryTestNotice'
            };

            if (!_.find(this.testNotices, noticeObj)) {
                console.dir(noticeObj);
                this.testNotices.push(noticeObj);
                // db에 공지데이터 넣기
                await NoticeDB.create(noticeObj);
                // mq send
                await rabbitmq.assertQueue('notice.maplestory');
                await rabbitmq.bindQueue('notice.maplestory', rabbitmq.mqConfig.exchange, 'notice');
                await rabbitmq.sendToQueue('notice.maplestory', noticeObj);
            }
        }
    }
}

const maplestory = new Maplestory();
// maplestory.init();

module.exports = maplestory;