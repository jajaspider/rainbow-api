const _ = require('lodash');
const express = require('express');
const router = express.Router();

const bossService = require('../../services/boss');
// const lostarkService = require('../../services/lostark');

// 해당 보스 정보 return
router.get('/:game/:name/:level', async function (req, res, next) {
    let resPayload = {
        isSuccess: false,
    };

    let result = await bossService.getRewards(req.params.name, req.params.level, req.params.game);
    if (_.get(result, 'errorInfo')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: _.get(result, 'errorInfo')
        }
        return res.json(resPayload);
    }

    resPayload.isSuccess = true;
    resPayload.payload = {
        rewards: result
    }
    return res.json(resPayload);
});

//해당 보스의 보상 가격 수정
router.put('/money', async function (req, res, next) {
    let resPayload = {
        isSuccess: false,
    };

    if (!_.get(req.body, 'game')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: "body game data required"
        }
        return res.json(resPayload);
    }
    if (!_.get(req.body, 'name')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: "body name data required"
        }
        return res.json(resPayload);
    }
    if (!_.get(req.body, 'level')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: "body level data required"
        }
        return res.json(resPayload);
    }
    if (!_.get(req.body, 'money')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: "body money data required"
        }
        return res.json(resPayload);
    }

    let result = await bossService.editMoney(req.body);
    if (_.get(result, 'errorInfo')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: _.get(result, 'errorInfo')
        }
        return res.json(resPayload);
    }

    resPayload.isSuccess = true;
    resPayload.payload = {
        rewards: result
    }
    return res.json(resPayload);
});

// 보상 1개의 데이터 수정
router.put('/reward', async function (req, res, next) {
    let resPayload = {
        isSuccess: false,
    };

    if (!_.get(req.body, 'game')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: "body game data required"
        }
        return res.json(resPayload);
    }
    if (!_.get(req.body, 'name')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: "body name data required"
        }
        return res.json(resPayload);
    }
    if (!_.get(req.body, 'level')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: "body level data required"
        }
        return res.json(resPayload);
    }
    if (!_.get(req.body, 'prev')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: "body prev data required"
        }
        return res.json(resPayload);
    }
    if (!_.get(req.body, 'curr')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: "body curr data required"
        }
        return res.json(resPayload);
    }

    let result = await bossService.editRewards(req.body);
    if (_.get(result, 'errorInfo')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: _.get(result, 'errorInfo')
        }
        return res.json(resPayload);
    }

    resPayload.isSuccess = true;
    resPayload.payload = {
        rewards: result
    }
    return res.json(resPayload);
});

//해당 보스 정보 생성
router.post('/register', async function (req, res, next) {
    let resPayload = {
        isSuccess: false,
    };

    if (!_.get(req.body, 'game')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: "body game data required"
        }
        return res.json(resPayload);
    }
    if (!_.get(req.body, 'name')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: "body name data required"
        }
        return res.json(resPayload);
    }
    if (!_.get(req.body, 'level')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: "body level data required"
        }
        return res.json(resPayload);
    }

    let result = await bossService.registrationBoss(req.body);
    if (_.get(result, 'errorInfo')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: _.get(result, 'errorInfo')
        }
        return res.json(resPayload);
    }

    resPayload.isSuccess = true;
    resPayload.payload = {
        rewards: result
    }
    return res.json(resPayload);
});

// 보상 1개의 데이터 삽입
router.post('/reward', async function (req, res, next) {
    let resPayload = {
        isSuccess: false,
    };

    if (!_.get(req.body, 'game')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: "body game data required"
        }
        return res.json(resPayload);
    }
    if (!_.get(req.body, 'name')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: "body name data required"
        }
        return res.json(resPayload);
    }
    if (!_.get(req.body, 'level')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: "body level data required"
        }
        return res.json(resPayload);
    }
    if (!_.get(req.body, 'reward')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: "body reward data required"
        }
        return res.json(resPayload);
    }

    let result = await bossService.insertReward(req.body);
    if (_.get(result, 'errorInfo')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: _.get(result, 'errorInfo')
        }
        return res.json(resPayload);
    }

    resPayload.isSuccess = true;
    resPayload.payload = {
        rewards: result
    }
    return res.json(resPayload);
});

// 보상 1개의 데이터 삭제
router.delete('/reward', async function (req, res, next) {
    let resPayload = {
        isSuccess: false,
    };

    if (!_.get(req.body, 'game')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: "body game data required"
        }
        return res.json(resPayload);
    }
    if (!_.get(req.body, 'name')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: "body name data required"
        }
        return res.json(resPayload);
    }
    if (!_.get(req.body, 'level')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: "body level data required"
        }
        return res.json(resPayload);
    }
    if (!_.get(req.body, 'reward')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: "body reward data required"
        }
        return res.json(resPayload);
    }

    let result = await bossService.deleteReward(req.body);
    if (_.get(result, 'errorInfo')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: _.get(result, 'errorInfo')
        }
        return res.json(resPayload);
    }

    resPayload.isSuccess = true;
    resPayload.payload = {
        rewards: result
    }
    return res.json(resPayload);
});

module.exports = router;