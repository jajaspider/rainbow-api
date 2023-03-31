const _ = require("lodash");

function toJSON(dbData) {
  dbData = JSON.parse(JSON.stringify(dbData));

  return dbData;
}

module.exports = { toJSON };
