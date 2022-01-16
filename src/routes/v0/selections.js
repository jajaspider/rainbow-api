const express = require('express');
const router = express.Router();
const utils = require('../../core/utils');
const _ = require('lodash');
const selectionService = require('../../services/selection');

/* GET users listing. */
router.get('/:type', async function (req, res, next) {
    let resPayload = {
        isSuccess: false,
    };

    let result = await selectionService.getOne(req.params.type);
    resPayload.isSuccess = true;
    resPayload.payload = {
        message: result,
    }
    return res.json(resPayload);
});

router.post('/register', async function (req, res, next) {
    let resPayload = {
        isSuccess: false,
    };

    if (!_.get(req.body, 'name')) {
        resPayload.isSuccess = false
        resPayload.payload = {
            error: 'require name'
        };

        return res.json(resPayload);
    }

    if (!_.get(req.body, 'type')) {
        resPayload.isSuccess = false
        resPayload.payload = {
            error: 'require type'
        };

        return res.json(resPayload);
    }

    if (!_.get(req.body, 'author')) {
        resPayload.isSuccess = false
        resPayload.payload = {
            error: 'require name'
        };

        return res.json(resPayload);
    }

    let result = await selectionService.register(req.body);
    resPayload.isSuccess = true;
    resPayload.payload = {
        message: result,
    };


    return res.send(resPayload);
});

module.exports = router;