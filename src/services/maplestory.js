const _ = require("lodash");
const axios = require('axios');
const cheerio = require('cheerio');

const exp = require("../core/exp");
const MapleClass = require('../models').MapleClass;
const util = require('../utils');

async function getInfo(name) {
    let result = await axios.get(`https://maplestory.nexon.com/Ranking/World/Total?c=${encodeURIComponent(name)}&w=0`);
    if (result.status != 200) {
        return {};
    }

    let html = cheerio.load(result.data);

    let errorInfo = html(`#container > div > div > div:nth-child(4) > div`).text();
    if (errorInfo == '랭킹정보가 없습니다.') {
        return {
            errorInfo
        };
    }

    let resultMg = await axios.get(`https://maple.gg/u/${encodeURIComponent(name)}`);
    if (resultMg.status != 200) {
        return {};
    }
    let htmlMg = cheerio.load(resultMg.data);

    let updateDate = htmlMg(`#user-profile > section > div.row.row-normal > div.col-lg-8 > div.mt-2.text-right.clearfix > div.float-left.font-size-12.text-left > span`).text();
    updateDate = updateDate.replace(/\n/g, "").replace(/ +/g, " ").trim();
    // 오늘 업데이트가 아니라면 업데이트
    if (updateDate != '마지막 업데이트: 오늘') {
        await axios.get(`https://maple.gg/u/${encodeURIComponent(name)}/sync`);

        // 업데이트된 후 다시 재접근
        resultMg = await axios.get(`https://maple.gg/u/${encodeURIComponent(name)}`);
        if (resultMg.status != 200) {
            return {};
        }
        htmlMg = cheerio.load(resultMg.data);
    }

    let characterRows = html('#container > div > div > div:nth-child(4) > div.rank_table_wrap > table > tbody > tr');

    for (let characterRow of characterRows) {
        if (_.get(characterRow, 'attribs.class') != 'search_com_chk') {
            continue;
        }


        let characterTd = cheerio.load(characterRow.children);
        let tds = characterTd('td');
        // console.dir(tds);
        // for (let i = 0; i < tds.length; i += 1) {
        //     console.dir(tds[i].children);
        // }

        let ranking = characterTd('td > p').text().replace(/\n/g, '').replace(/ +/g, " ").trim().split(" ");
        let imgSrc = characterTd('td > span.char_img > img').attr().src;
        let characterName = characterTd('td > dl > dt > a').text();
        let characterClass = characterTd('td > dl > dd').text().split("/")[1].trim();
        let characterLevel = _.get(tds[2], 'children.0.data');
        let characterExp = _.get(tds[3], 'children.0.data');
        characterExp = characterExp.replace(/[^0-9]/g, "");
        characterExp = exp.getPercent(characterLevel.replace(/[^0-9]/g, ""), characterExp);
        let characterPop = _.get(tds[4], 'children.0.data');
        let characterGuild = _.get(tds[5], 'children.0.data');
        let dojang = htmlMg('#app > div.card.border-bottom-0 > div > section > div.row.text-center > div:nth-child(1) > section > div > div > div').text().replace(/\n/g, '').replace(/ +/g, " ").trim().split(" ");
        let dojangTime = null;
        if (dojang[2] || dojang[3]) {
            dojangTime = `${dojang[2]} ${dojang[3]}`;
        }

        let seed = htmlMg('#app > div.card.border-bottom-0 > div > section > div.row.text-center > div:nth-child(2) > section > div > div > div').text().replace(/\n/g, '').replace(/ +/g, " ").trim().split(" ");
        let seedTime = null;
        if (seed[2] || seed[3]) {
            seedTime = `${seed[2]} ${seed[3]}`;
        }

        let character = {
            name: characterName,
            level: characterLevel,
            class: characterClass,
            exp: characterExp,
            pop: characterPop,
            guild: characterGuild,
            img: imgSrc,
            ranking: {
                current: ranking[0],
                change: ranking[1]
            },
            dojang: {
                stair: dojang[0] || '-',
                time: dojangTime || '-',
            },
            seed: {
                stair: seed[0] || '-',
                time: seedTime || '-'
            }
        };

        return character;
    }
}

async function getStarForce(level, star) {
    let itemTable = {};

    // let i;
    let arr = ['130', '140', '150', '160', '200'];
    for (i = 0; i < arr.length; i += 1) {
        itemTable[arr[i]] = {};
    }

    for (let i = 0; i < arr.length; i += 1) {
        for (let j = 0; j < 25; j += 1) {
            let stat = 0;
            let attack = 0;
            for (let k = 0; k <= j; k++) {
                if (0 < k && k <= 5) {
                    stat += 2;
                } else if (5 < k && k <= 15) {
                    stat += 3;
                }
            }

            let attackStar = j - 15;
            for (let k = 0; k < attackStar; k++) {
                // item-> 160 > 3
                // 0 attack 10
                if (k < 6) {
                    attack += (7 + i + k);
                    stat += (7 + 2 * i);
                }
                if (k === 6) {
                    attack += (7 + i + k + 1);
                    stat += (7 + 2 * i);
                }
            }
            let attackStar2 = j - 22;
            if (22 <= j) {
                for (let k = 0; k < attackStar2; k++) {
                    attack += (16 + i + k * 2);
                }
            }

            if (i == 4 && 0 < attackStar) {
                attack += (attackStar);
            }

            itemTable[arr[i]][j] = {
                stat,
                attack
            };

            // itemTable[arr[i]] = {
            //     j: {
            //         stat,
            //         attack
            //     }
            // };
        }

    }

    return _.get(itemTable, `${level}.${star}`) || {
        errorInfo: '잘못입력하셨습니다.'
    };
}

function getGrowthPer(type, level) {
    // 익스트림 성장의 비약 - 199레벨 경험치
    // 성장의 비약1 - 209레벨 경험치
    // 성장의 비약2 - 219레벨 경험치
    // 성장의 비약3 - 229레벨 경험치
    // 태풍 성장의 비약 - 239레벨 경험치
    // 극한 성장의 비약 - 249레벨 경험치

    let expValue = 0;
    switch (type) {
        case 'leap':
            if (level >= 140 && level < 200) {
                return "측정할 수 없습니다.";
            }
            if (level < 140) {
                return "사용이 불가능합니다.";
            }
            expValue = exp.character[199];
            break;
        case 'elixir1':
            expValue = exp.character[209];
            break;
        case 'elixir2':
            expValue = exp.character[219];
            break;
        case 'elixir3':
            expValue = exp.character[229];
            break;
        case 'typhoon':
            expValue = exp.character[239];
            break;
        case 'extreme':
            expValue = exp.character[249];
            break;
        default:
            break;

    }
    if (level < 200) {
        return "사용이 불가능합니다.";
    }

    const expPercent = exp.getPercent(parseInt(level), expValue);
    return parseFloat(expPercent) >= 100 ? "1레벨 상승" : expPercent;
}

async function getClass(type) {
    if (!type) {
        let classes = await MapleClass.find();
        classes = util.toJSON(classes);
        let randomOne = _.sample(classes);

        return _.get(randomOne, 'className');
    }

    let allowStat = ['str', 'dex', 'int', 'luk', 'hp', '힘', '덱스', '인트', '럭'];
    let allowGroup = ['모험가', '시그너스', '레지스탕스', '영웅', '노바', '레프', '아니마', '제로', '키네시스'];
    let aloowType = ['전사', '마법사', '궁수', '도적', '해적'];
    let query = {};
    if (_.includes(allowStat, type)) {
        if (type == '힘') {
            type = 'str'
        }
        else if (type == '덱스') {
            type = 'dex'
        }
        else if (type == '인트') {
            type = 'int'
        }
        else if (type == '럭') {
            type = 'luk'
        }
        else if (type == '체력') {
            type = 'hp'
        }

        query = { classStat: type };
    }
    else if (_.includes(allowGroup, type)) {

        query = { classGroup: type };
    }
    else if (_.includes(aloowType, type)) {
        query = { classType: type };
    }

    let classes = await MapleClass.find(query);
    classes = util.toJSON(classes);
    let randomOne = _.sample(classes);

    return _.get(randomOne, 'className');
}


// function getSymbol(start, end) {

//     symbol.getCal(start, end);
// }

module.exports = {
    getInfo,
    getStarForce,
    getGrowthPer,
    // getSymbol,
    getClass
};