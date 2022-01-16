const selectionDB = require('../models').Selection;
const _ = require('lodash');

async function registerSelection(params) {
    let name = _.get(params, 'name');
    let type = _.get(params, 'type');
    let author = _.get(params, 'author');

    let findResult = await selectionDB.find({
        name,
        type
    }).lean();

    if (!_.isEmpty(findResult)) {
        return "이미 등록되었습니다";
    }

    await selectionDB.create({
        name,
        type,
        author
    });
    return "등록되었습니다."
}

async function getOne(type) {
    let findResult = await selectionDB.find({
        type
    }).lean();

    if (_.isEmpty(findResult)) {
        return "선택할 데이터가 없습니다.";
    }

    let item = _.sample(findResult);
    return _.get(item, 'name');
}

module.exports = {
    register: registerSelection,
    getOne,
};