const _ = require("lodash");

const util = require('../utils');
const DB = require('../models'),
    Boss = DB.Boss;

async function getRewards(name, level, game) {
    let bossReward = await Boss.findOne({ name, level, game });
    bossReward = util.toJSON(bossReward);

    if (!bossReward) {
        return {
            errorInfo: "정보 없음"
        };
    }

    bossReward = _.omit(bossReward, ["_id", "createdAt", "updatedAt", "__v"]);
    return bossReward;
}

async function editMoney(bodyData) {
    let name = _.get(bodyData, 'name');
    let level = _.get(bodyData, 'level');
    let money = _.get(bodyData, 'money');

    try {
        let bossReward = await Boss.findOneAndUpdate({ name, level }, { money }, { new: true });
        if (!bossReward) {
            return {
                errorInfo: "정보 없음"
            };
        }

        return bossReward;
    }
    catch (e) {
        return {
            errorInfo: e.reason.toString()
        }
    }
}

async function editReward(bodyData) {
    let name = _.get(bodyData, 'name');
    let level = _.get(bodyData, 'level');
    let prev = _.get(bodyData, 'prev');
    let curr = _.get(bodyData, 'curr');

    try {
        let bossReward = await Boss.findOne({ name, level });
        if (!bossReward) {
            return {
                errorInfo: "보스 정보 없음"
            };
        }

        let rewards = _.get(bossReward, 'rewards');

        let rewardIndex = _.findIndex(rewards, (reward) => {
            return reward == prev;
        });
        if (rewardIndex == -1) {
            return {
                errorInfo: "보상 정보 없음"
            };
        }
        rewards[rewardIndex] = curr;

        let result = await Boss.findOneAndUpdate({ name, level }, { rewards }, { new: true });
        return result;
    }
    catch (e) {
        console.dir(e);
    }
}

async function registrationBoss(bodyData) {
    let game = _.get(bodyData, 'game');
    let name = _.get(bodyData, 'name');
    let level = _.get(bodyData, 'level');

    let bossReward = await Boss.findOne({ name, level, game });
    bossReward = util.toJSON(bossReward);

    if (bossReward) {
        return {
            errorInfo: "이미 동일한 보스가 있습니다."
        };
    }

    let result = await Boss.create({
        name,
        level,
        game,
        money: 0,
        rewards: []
    });

    return result;
}

async function insertReward(bodyData) {
    let name = _.get(bodyData, 'name');
    let level = _.get(bodyData, 'level');
    let reward = _.get(bodyData, 'reward');

    let bossReward = await Boss.findOne({ name, level });
    if (!bossReward) {
        return {
            errorInfo: "보스 정보 없음"
        };
    }

    let rewards = _.get(bossReward, 'rewards');
    rewards.push(reward);

    let result = await Boss.findOneAndUpdate({ name, level }, { rewards }, { new: true });
    return result;
}

async function deleteReward(bodyData) {
    let name = _.get(bodyData, 'name');
    let level = _.get(bodyData, 'level');
    let reward = _.get(bodyData, 'reward');

    try {
        let bossReward = await Boss.findOne({ name, level });
        if (!bossReward) {
            return {
                errorInfo: "보스 정보 없음"
            };
        }

        //기존 document에서 rewards데이터 가져오기
        let rewards = _.get(bossReward, 'rewards');

        // rewardIndex를 조사해서 있는 보상인지 확인
        let rewardIndex = _.findIndex(rewards, (_reward) => {
            return _reward == reward;
        });
        if (rewardIndex == -1) {
            return {
                errorInfo: "보상 정보 없음"
            };
        }

        //filter를 통해서 reward 제거
        rewards = _.filter(rewards, (_reward) => {
            return _reward != reward;
        });

        let result = await Boss.findOneAndUpdate({ name, level }, { rewards }, { new: true });
        return result;
    }
    catch (e) {
        console.dir(e);
    }
}

module.exports = {
    getRewards,
    editMoney,
    editReward,
    registrationBoss,
    insertReward,
    deleteReward,
};