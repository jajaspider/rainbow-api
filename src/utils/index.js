const _ = require('lodash');

function toJSON(data) {
    return JSON.parse(JSON.stringify(data));
}

module.exports = { toJSON };