const express = require("express");
const router = express.Router();

const selectionRouter = require("./selections");
const lostarkRouter = require("./lostark");
const maplestoryRouter = require("./maplestory");
const imageRouter = require("./images");
const theMoreRouter = require("./themore/index");

router.use("/selection", selectionRouter);
router.use("/lostark", lostarkRouter);
router.use("/maplestory", maplestoryRouter);
router.use("/images", imageRouter);
router.use("/themore", theMoreRouter);

module.exports = router;
