const _ = require("lodash");
const axios = require('axios');
const cheerio = require('cheerio');

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
        let characterClass = characterTd('td > dl > dd').text();
        let characterLevel = _.get(tds[2], 'children.0.data');
        let characterExp = _.get(tds[3], 'children.0.data');
        let characterPop = _.get(tds[4], 'children.0.data');
        let characterGuild = _.get(tds[5], 'children.0.data');
        let dojang = htmlMg('#app > div.card.border-bottom-0 > div > section > div.row.text-center > div:nth-child(1) > section > div > div > div').text().replace(/\n/g, '').replace(/ +/g, " ").trim().split(" ");
        let seed = htmlMg('#app > div.card.border-bottom-0 > div > section > div.row.text-center > div:nth-child(2) > section > div > div > div').text().replace(/\n/g, '').replace(/ +/g, " ").trim().split(" ");

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
                stair: dojang[0],
                time: `${dojang[2]} ${dojang[3]}`
            },
            seed: {
                stair: seed[0],
                time: `${seed[2]} ${seed[3]}`
            }
        };

        return character;
    }
}

module.exports = {
    getInfo,
};