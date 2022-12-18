function toJSON(dbData) {
    return JSON.parse(JSON.stringify(dbData));
}

module.exports = { toJSON };