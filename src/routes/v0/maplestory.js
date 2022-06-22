const express = require('express');
const router = express.Router();
const maplestoryService = require('../../services/maplestory');
const _ = require('lodash');

router.get('/info/:name', async function (req, res, next) {
    let resPayload = {
        isSuccess: false,
    };

    let result = await maplestoryService.getInfo(req.params.name);
    if (_.get(result, 'errorInfo')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: _.get(result, 'errorInfo')
        }
        return res.json(resPayload);
    }

    resPayload.isSuccess = true;
    resPayload.payload = {
        character: result
    }
    return res.json(resPayload);
});

router.get('/starforce/:level/:star', async function (req, res, next) {
    let resPayload = {
        isSuccess: false,
    };

    let result = await maplestoryService.getStarForce(req.params.level, req.params.star);
    if (_.get(result, 'errorInfo')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: _.get(result, 'errorInfo')
        }
        return res.json(resPayload);
    }

    resPayload.isSuccess = true;
    resPayload.payload = {
        starforce: result
    }
    return res.json(resPayload);
});

router.get('/growth/:level', async function (req, res, next) {
    let resPayload = {
        isSuccess: false,
    };

    if (!_.get(req.body, 'type')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: "type을 확인하세요"
        }
        return res.json(resPayload);
    }

    let result = maplestoryService.getGrowthPer(req.body.type, req.params.level);

    resPayload.isSuccess = true;
    resPayload.payload = {
        percent: result
    }
    return res.json(resPayload);
});

router.get('/union/:name', async function (req, res, next) {
    let resPayload = {
        isSuccess: false,
    };

    let result = await maplestoryService.getUnionInfo(req.params.name);
    if (_.get(result, 'errorInfo')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: _.get(result, 'errorInfo')
        }
        return res.json(resPayload);
    }

    resPayload.isSuccess = true;
    resPayload.payload = {
        character: result
    }
    return res.json(resPayload);
});


module.exports = router;