const express = require('express');
const router = express.Router();

const selectionRouter = require('./selections');
const lostarkRouter = require('./lostark');
const maplestoryRouter = require('./maplestory');

router.use('/selection', selectionRouter);
router.use('/lostark', lostarkRouter);
router.use('/maplestory', maplestoryRouter);

module.exports = router;