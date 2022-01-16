const fs = require('fs');
const {
    promisify
} = require('util');

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

module.exports = {
    writeFile,
    readFile
};