const _ = require("lodash");
const axios = require("axios");
const path = require("path");
const yaml = require("js-yaml");
const fs = require("fs");

let configPath = path.join(process.cwd(), "config", "rainbow.develop.yaml");
let config = yaml.load(fs.readFileSync(configPath));

async function sendMessage(userId, text) {
  try {
    await axios.post(
      `https://api.telegram.org/bot${_.get(
        config,
        "telegram_api_key"
      )}/sendMessage`,
      { chat_id: userId, text: text }
    );
  } catch (e) {}
}

module.exports = { sendMessage };
