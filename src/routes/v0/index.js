const express = require('express');
const router = express.Router();

const selectionRouter = require('./selections');
const lostarkRouter = require('./lostark');
const maplestoryRouter = require('./maplestory');
const imageRouter = require('./images');
const bossRouter = require('./boss');

router.use('/selection', selectionRouter);
router.use('/lostark', lostarkRouter);
router.use('/maplestory', maplestoryRouter);
router.use('/images', imageRouter);
router.use('/boss', bossRouter);

module.exports = router;