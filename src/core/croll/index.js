const maplestory = require('./maplestory');
const lostark = require("./lostark");

class Croll {
    constructor() {

    }
    async init() {
        await maplestory.init();
        await lostark.init();

        this.maplestoryNotice = setInterval(async () => {
            await maplestory.crollNotice();
        }, 5000);
        this.maplestoryTestNotice = setInterval(async () => {
            await maplestory.crollTestNotice();
        }, 5000);

        this.lostarkNotice = setInterval(async () => {
            await lostark.crollNotice();
        }, 5000);
    }
}

const croll = new Croll();
croll.init();

module.exports = croll;