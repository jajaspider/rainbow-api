const _ = require("lodash");
const axios = require('axios');
const cheerio = require('cheerio');

async function getInfo(name) {
    let result = await axios.get(`https://lostark.game.onstove.com/Profile/Character/${encodeURIComponent(name)}`);
    if (result.status != 200) {
        return {};
    }

    let html = cheerio.load(result.data);

    let errorInfo = html('#lostark-wrapper > div > main > div > div.profile-ingame > div > span:nth-child(1)').text();
    if (errorInfo) {
        return {
            errorInfo
        };
    }

    let server = html('#lostark-wrapper > div > main > div > div.profile-character-info > span.profile-character-info__server').text();
    server = server.replace("@", "");
    let nickname = html('#lostark-wrapper > div > main > div > div.profile-character-info > span.profile-character-info__name').text();
    let job = html('#lostark-wrapper > div > main > div > div.profile-character-info > img');
    job = _.get(job, '0.attribs.alt');
    let fightLevel = html('#lostark-wrapper > div > main > div > div.profile-ingame > div.profile-info > div.level-info > div.level-info__item > span:nth-child(2)').text();
    let itemLevel = html('#lostark-wrapper > div > main > div > div.profile-ingame > div.profile-info > div.level-info2 > div.level-info2__expedition > span:nth-child(2)').text();
    let attack = html('#profile-ability > div.profile-ability-basic > ul > li:nth-child(1) > span:nth-child(2)').text();
    let health = html('#profile-ability > div.profile-ability-basic > ul > li:nth-child(2) > span:nth-child(2)').text();

    let specifics = html('#profile-ability > div.profile-ability-battle > ul > li > span');
    let specificList = [];
    for (let i = 0; i < specifics.length; i += 2) {
        let specificName = _.get(specifics[i], 'children.0.data');
        let specificValue = _.get(specifics[i + 1], 'children.0.data');

        specificList.push({
            specificName,
            specificValue
        });
    }

    let guildName = html('#lostark-wrapper > div > main > div > div.profile-ingame > div.profile-info > div.game-info > div.game-info__guild > span:nth-child(2)').text();

    let engraveList = [];
    let engraves = html('#profile-ability > div.profile-ability-engrave > div > div.swiper-wrapper > ul > li > span');
    for (let engrave of engraves) {
        engraveList.push(_.get(engrave, 'children.0.data'));
    }

    let cardList = [];
    let cards = html('#cardSetList > li > div');
    for (let i = 0; i < cards.length; i += 2) {
        let cardSet = _.get(cards[i], 'children.0.data');
        let cardSetValue = _.get(cards[i + 1], 'children.0.data');

        cardList.push({
            cardSet,
            cardSetValue
        });
    }


    let character = {
        server,
        nickname,
        job,
        fightLevel,
        itemLevel,
        attack,
        health,
        specificList,
        guildName,
        engraveList,
        cardList
    }

    return character;
}

async function getCrystal() {
    // 2022. 01. 31
    // 웹 접근 전 기존 크리스탈을 업데이트했던 시간을 디비에서 확인후, 최소 5분이상이 지나야 새로운 데이터를 불러와서 넣어주는 형태로 변경 해야함.

    let result = await axios.get('https://loatool.taeu.kr/lospi');
    if (result.status != 200) {
        return {
            errorInfo: "접근 실패"
        };
    }

    let html = cheerio.load(result.data);

    let regex = /[^0-9]/g;
    let buyPrice = html('#app > div > main > div > div > div > div > div.d-flex.flex-row.justify-center > div > div > div:nth-child(1) > div > div > div.v-card__text.text-center > div:nth-child(2) > div:nth-child(1) > span').text();
    buyPrice = buyPrice.replace(regex, "");
    let sellPrice = html('#app > div > main > div > div > div > div > div.d-flex.flex-row.justify-center > div > div > div:nth-child(1) > div > div > div.v-card__text.text-center > div:nth-child(2) > div:nth-child(2) > span').text();
    sellPrice = sellPrice.replace(regex, "");

    return {
        buyPrice,
        sellPrice
    };
}

module.exports = {
    getInfo,
    getCrystal
};