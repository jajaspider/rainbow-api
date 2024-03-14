const _ = require("lodash");

function toJSON(dbData) {
  dbData = JSON.parse(JSON.stringify(dbData));

  return dbData;
}

async function sleep(milliseconds) {
  await new Promise((resolve, reject) => {
    setTimeout(resolve, milliseconds);
  });
}

module.exports = { toJSON, sleep };
