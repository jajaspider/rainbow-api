const express = require('express');
const router = express.Router();

const selectionRouter = require('./selections');

router.use('/selection', selectionRouter);

module.exports = router;