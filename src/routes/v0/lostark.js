const express = require('express');
const router = express.Router();
const lostarkService = require('../../services/lostark');

router.get('/info/:name', async function (req, res, next) {
    let resPayload = {
        isSuccess: false,
    };

    let character = await lostarkService.getInfo(req.params.name);
    if (_.isEmpty(character)) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: '결과가 없습니다'
        }
    }
    else if (_.get(character, 'errorInfo')) {
        resPayload.isSuccess = false;
        resPayload.payload = {
            message: _.get(character, 'errorInfo'),
        }
    }

    resPayload.isSuccess = true;
    resPayload.payload = {
        character
    }
    return res.json(resPayload);
});

module.exports = router;