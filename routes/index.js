const express = require('express');
const router = express.Router();

const v0 = require('./v0');

router.use('/v0', v0);

module.exports = router;