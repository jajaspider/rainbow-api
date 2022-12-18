const express = require("express");
const router = express.Router();
const lostarkService = require("../../services/lostark");
const _ = require("lodash");

router.get("/info/:name", async function (req, res, next) {
  let resPayload = {
    isSuccess: false,
  };

  let character = await lostarkService.getInfo(req.params.name);
  if (_.isEmpty(character)) {
    resPayload.isSuccess = false;
    resPayload.payload = {
      message: "결과가 없습니다",
    };
    return res.json(resPayload);
  } else if (_.get(character, "errorInfo")) {
    resPayload.isSuccess = false;
    resPayload.payload = {
      message: _.get(character, "errorInfo"),
    };
    return res.json(resPayload);
  }

  resPayload.isSuccess = true;
  resPayload.payload = {
    character,
  };
  return res.json(resPayload);
});

router.get("/crystal", async function (req, res, next) {
  let resPayload = {
    isSuccess: false,
  };

  let result = await lostarkService.getCrystal();
  if (_.get(result, "errorInfo")) {
    resPayload.isSuccess = false;
    resPayload.payload = {
      message: _.get(result, "errorInfo"),
    };
    return res.json(resPayload);
  }

  resPayload.isSuccess = true;
  resPayload.payload = {
    result,
  };
  return res.json(resPayload);
});

router.get("/expand/:name", async function (req, res, next) {
  let resPayload = {
    isSuccess: false,
  };

  let result = await lostarkService.getExpandCharacter(req.params.name);
  if (_.get(result, "errorInfo")) {
    resPayload.isSuccess = false;
    resPayload.payload = {
      message: _.get(result, "errorInfo"),
    };
    return res.json(resPayload);
  }

  resPayload.isSuccess = true;
  resPayload.payload = {
    result,
  };
  return res.json(resPayload);
});

router.get("/event", async function (req, res, next) {
  let resPayload = {
    isSuccess: false,
  };

  let result = await lostarkService.getEventList();

  resPayload.isSuccess = true;
  resPayload.payload = {
    events: result,
  };
  return res.json(resPayload);
});

router.get("/distribute/:gold", async function (req, res, next) {
  let resPayload = {
    isSuccess: false,
  };

  let result = await lostarkService.getDistributeAmount(req.params.gold);
  if (_.get(result, "errorInfo")) {
    resPayload.isSuccess = false;
    resPayload.payload = {
      message: _.get(result, "errorInfo"),
    };
    return res.json(resPayload);
  }

  resPayload.isSuccess = true;
  resPayload.payload = {
    result,
  };
  return res.json(resPayload);
});

router.post("/markets/itemSearch", async function (req, res, next) {
  if (!_.get(req.body, "categoryName")) {
    return res.status(400).json({ error: "categoryName parameter missing" });
  }

  if (!_.get(req.body, "itemName")) {
    return res.status(400).json({ error: "itemName parameter missing" });
  }

  try {
    let itemList = await lostarkService.marketSearching(
      req.body.categoryName,
      req.body.itemName
    );
    return res.json(itemList);
  } catch (e) {
    // console.dir(e);
    return res.status(e.code).json({ error: e.message });
  }
});

module.exports = router;
