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


module.exports = router;