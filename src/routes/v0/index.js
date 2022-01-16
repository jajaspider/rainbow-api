const express = require('express');
const router = express.Router();

const userRouter = require('./users');
const selectionRouter = require('./selections');

router.use('/user', userRouter);
router.use('/selection', selectionRouter);

module.exports = router;