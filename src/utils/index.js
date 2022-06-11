const _ = require('lodash');

function toJSON(dbData) {
    dbData = _.map(dbData, (_class) => {
        _class._doc._id = _class._doc._id.valueOf();
        return _class._doc
    });

    return dbData;
}

module.exports = { toJSON };