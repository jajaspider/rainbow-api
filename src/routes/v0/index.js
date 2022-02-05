const express = require('express');
const router = express.Router();

const selectionRouter = require('./selections');
const lostarkRouter = require('./lostark');

router.use('/selection', selectionRouter);
router.use('/lostark', lostarkRouter);

module.exports = router;