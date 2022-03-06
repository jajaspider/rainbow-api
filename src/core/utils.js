const fs = require('fs');
const {
    promisify
} = require('util');
const {
    exec,
} = require('child_process');

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const execSync = promisify(exec);
const exist = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);
const rm = promisify(fs.rm);

module.exports = {
    writeFile,
    readFile,
    execSync,
    exist,
    mkdir,
    rm
};