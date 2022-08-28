const _ = require("lodash");
const axios = require('axios');
const cheerio = require('cheerio');
const DB = require('../models'),
    Character = DB.LostarkCharacter;

async function getInfo(name) {
    // 2022. 02. 02
    // 캐릭터 데이터를 뽑아오기전에 마지막으로 업데이트한시간을 찾아서 5분내면 db데이터를 return 그게아니라면 업데이트
    let existCharacter = await Character.findOne({ name: name }).sort({ createdAt: -1 });
    existCharacter = JSON.parse(JSON.stringify(existCharacter));
    // 이미 캐릭터가 있다면
    if (existCharacter) {
        let prevDate = new Date(_.get(existCharacter, 'createdAt'));
        let currDate = new Date();

        //차이나는 시간을 계산해서
        let mins = Number.parseFloat((currDate - prevDate) / 1000 / 60);
        //5분이하라면 기존 데이터 리턴
        if (mins <= 5.0) {
            return _.get(existCharacter, 'character');
        }
    }

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
    let characterImage = html(`#profile-equipment > div.profile-equipment__character > img`);
    characterImage = _.get(characterImage, '0.attribs.src');
    let expeditionLevel = html('#lostark-wrapper > div > main > div > div.profile-ingame > div.profile-info > div.level-info > div.level-info__expedition > span:nth-child(2)').text();
    let fightLevel = html('#lostark-wrapper > div > main > div > div.profile-ingame > div.profile-info > div.level-info > div.level-info__item > span:nth-child(2)').text();
    let itemLevel = html('#lostark-wrapper > div > main > div > div.profile-ingame > div.profile-info > div.level-info2 > div.level-info2__expedition > span:nth-child(2)').text();
    let attack = html('#profile-ability > div.profile-ability-basic > ul > li:nth-child(1) > span:nth-child(2)').text();
    let health = html('#profile-ability > div.profile-ability-basic > ul > li:nth-child(2) > span:nth-child(2)').text();
    let title = html('#lostark-wrapper > div > main > div > div.profile-ingame > div.profile-info > div.game-info > div.game-info__title > span:nth-child(2)').text();
    let pvp = html('#lostark-wrapper > div > main > div > div.profile-ingame > div.profile-info > div.game-info > div.level-info__pvp > span:nth-child(2)').text();
    let skillDatas = html('#profile-skill > div.profile-skill-battle > div.profile-skill__list > div > a');
    let skill = [];
    for (let skillData of skillDatas) {
        if (_.get(skillData, 'attribs.class') == 'button button--profile-skill') {
            let skillObj = JSON.parse(_.get(skillData, 'attribs.data-skill'));

            let tripod = [];
            for (let i = 0; i < skillObj.selectedTripodTier.length; i += 1) {
                let result = _.find(skillObj.tripodList, {
                    level: i,
                    slot: skillObj.selectedTripodTier[i]
                });
                if (result) {
                    tripod.push(result);
                }
            }

            skill.push({
                name: skillObj.name,
                level: skillObj.level,
                slotIcon: skillObj.slotIcon,
                tripod,
            })
        }
    }

    let jewels = [];
    let noJewel = html(`#profile-jewel > div > div.jewel-effect__list > div > span.no_jewel`);
    noJewel = _.get(noJewel, '0.attribs.class');
    // 보석이 있을때만
    if (!noJewel) {
        let jewelHtml = html(`#profile-jewel > div > div.jewel__wrap > span`);
        for (let _jewel of jewelHtml) {
            // 쥬얼이 배열이 안되어있기때문에 gemId로 정보 매칭
            let gemId = _.get(_jewel, 'attribs.id');

            // img는 보석의 멸화/홍염을 구분하기위함
            // level은 text로 기억
            let jewelHtml = cheerio.load(_jewel);
            let jewelevel = jewelHtml(`span.jewel_level`);
            let jewelImg = jewelHtml(`span.jewel_img`);

            jewelImg = _.get(jewelImg, '0.children.0.attribs.src');
            // 11_10은 이벤트 보석임
            let annihilations = ['46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '11_10'];
            for (let i = 0; i < annihilations.length; i += 1) {
                if (_.includes(jewelImg, annihilations[i])) {
                    jewels.push({
                        level: _.get(jewelevel, '0.children.0.data'),
                        type: 'annihilation',
                        gemId
                    })
                }
            }

            // 11_11은 이벤트 보석임
            let cooldowns = ['56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '11_11'];
            for (let i = 0; i < cooldowns.length; i += 1) {
                if (_.includes(jewelImg, cooldowns[i])) {
                    jewels.push({
                        level: _.get(jewelevel, '0.children.0.data'),
                        type: 'cooldown',
                        gemId
                    })
                }
            }
        }

        //jewels를 높은 레벨과 레벨 별 멸화/홍염으로 정리
        jewels = _.reverse(_.sortBy(jewels, ['level', 'type']));

        try {
            //보석의 스킬 상세 정보를 획득 하기위함
            let jewelDetails = html('#profile-jewel > div > div.jewel-effect__list > div > ul > li');
            // console.dir(jewelDetails);
            for (let _jewelDetail of jewelDetails) {
                //해당 slot의 보석 데이터를 획득
                let jewelDetailHtml = cheerio.load(_jewelDetail);
                let jewelSlot = jewelDetailHtml(`span.slot`);
                let skillName = jewelDetailHtml(`strong.skill_tit`);
                //gemId로 데이터 매칭
                let gemId = _.get(jewelSlot, '0.attribs.data-gemkey');

                //실제 스킬 정보를 획득
                let jewelInfo = jewelDetailHtml('p.skill_detail');

                let jewelObj = _.find(jewels, { gemId });
                jewelObj.info = jewelInfo.text();
                jewelObj.name = skillName.text();
            }
        }
        catch (e) {
            // 3티어 이상의 보석을 추출하지않으면, 기존의 jewels에 데이터가 없어서 처리되지않음
            // 그래서 error를 무시함
        }

    }

    // If use the getCollection post method, obtain information from the document.
    let lines = _.split(result.data, '\n');
    let characterUnique = {};
    for (let line of lines) {
        if (_.includes(line, '_memberNo')) {
            line = line.replace('\t\tvar _memberNo = \'', '').replace('\';\r', '');
            characterUnique.memberNo = line;
        }
        if (_.includes(line, '_worldNo')) {
            line = line.replace('\t\tvar _worldNo = \'', '').replace('\';\r', '');
            characterUnique.worldNo = line;
        }
        if (_.includes(line, '_pcId')) {
            line = line.replace('\t\tvar _pcId = \'', '').replace('\';\r', '');
            characterUnique.pcId = line;
        }
    }

    let collectionList = [];

    let collectionRes = await axios.post("https://lostark.game.onstove.com/Profile/GetCollection", characterUnique);
    let collectionHtml = cheerio.load(collectionRes.data);
    let collections = collectionHtml(`div > div.lui-tab__menu > a`);

    for (let _collection of collections) {
        collectionList.push({
            name: _.get(_collection, 'children.0.data').trim(),
            count: _.get(_collection, 'children.1.children.0.data')
        })
    }

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
        characterImage,
        attack,
        health,
        specificList,
        guildName,
        engraveList,
        cardList,
        expeditionLevel,
        title,
        pvp,
        skill,
        jewel: jewels,
        collection: collectionList
    }

    await Character.create({
        name: nickname,
        character
    })

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

async function getExpandCharacter(name) {
    let result = await axios.get(`https://lostark.game.onstove.com/Profile/Character/${encodeURIComponent(name)}`);
    if (result.status != 200) {
        return {
            errorInfo: "접근 실패"
        };
    }

    let html = cheerio.load(result.data);

    let serverList = html('#expand-character-list > strong');
    let expandCharacter = [];

    for (let i = 0; i < serverList.length; i += 1) {
        let server = _.get(serverList[i], 'children.0.data');
        server = server.replace('@', '');

        let characterList = [];
        let characters = html(`#expand-character-list > ul:nth-child(${3 + i * 2}) > li > span > button > span`);

        for (let character of characters) {
            let _characterInfo = await axios.get(`http://127.0.0.1:30003/v0/lostark/info/${encodeURIComponent(_.get(character, 'children.0.data'))}`);

            let characterData = _.get(_characterInfo, 'data');
            let itemLevelStr = _.get(characterData, 'payload.character.itemLevel');
            itemLevelStr = itemLevelStr.replace("Lv.", "");
            let numberRegex = /[^0-9.]/g;
            let itemLevel = Number.parseFloat(itemLevelStr.replace(numberRegex, ""));

            characterList.push({
                name: _.get(character, 'children.0.data'),
                itemLevel,
                itemLevelStr
            })
        }
        characterList = _.sortBy(characterList, 'itemLevel').reverse();

        expandCharacter.push({
            server,
            characterList
        });
    }

    return expandCharacter;
}

async function getEventList() {
    const entPoint = "https://lostark.game.onstove.com/";
    const url = `${entPoint}/News/Event/Now`;
    let response = await axios.get(url);
    let responseData = _.get(response, 'data');

    let eventPage = cheerio.load(responseData);
    let eventList = eventPage(`#lostark-wrapper > div > main > div > div > div.list.list--event > ul > li`);

    let events = [];
    for (let _event of eventList) {
        let eventHtml = cheerio.load(_event);

        let hrefHtml = eventHtml(`a`);
        let href = _.get(hrefHtml, '0.attribs.href');

        let imgSrc = eventHtml(`a > div.list__thumb > img`);
        imgSrc = _.get(imgSrc, '0.attribs.src');

        let titleHtml = eventHtml(`a > div.list__subject > span`);
        let title = _.get(titleHtml, '0.children.0.data');

        let term = eventHtml(`a > div.list__term`).text();

        let receive = eventHtml(`a > div.list__receive`).text();

        // let imgSrc = eventHtml(`div > dl > dt > a > img`);
        // imgSrc = _.get(imgSrc, '0.attribs.src');

        // let targetNode = eventHtml(`div > dl > dd.data > p > a`);

        // let href = _.get(targetNode, '0.attribs.href');
        // let title = _.get(targetNode, '0.children.0.data');

        // let dateNode = eventHtml(`div > dl > dd.date > p`).text();

        events.push({
            title: title,
            img_path: imgSrc,
            link: `${href}`,
            term: term,
            receive: receive
        })
    }
    return events;
}

module.exports = {
    getInfo,
    getCrystal,
    getExpandCharacter,
    getEventList
};