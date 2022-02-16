class Exp {
    constructor() {
        this.exp = 1242;
        this.character = {};
        this.increase = {};
    }

    init() {
        this.increase[10] = 0;
        for (let i = 10; i < 15; i += 1) {
            this.increase[i] = 0;
        }
        for (let i = 15; i < 30; i += 1) {
            this.increase[i] = 20;
        }
        for (let i = 30; i < 35; i += 1) {
            this.increase[i] = 0;
        }
        for (let i = 35; i < 40; i += 1) {
            this.increase[i] = 20;
        }
        for (let i = 35; i < 40; i += 1) {
            this.increase[i] = 20;
        }
        for (let i = 40; i < 60; i += 1) {
            this.increase[i] = 8;
        }
        for (let i = 60; i < 65; i += 1) {
            this.increase[i] = 0;
        }
        for (let i = 65; i < 75; i += 1) {
            this.increase[i] = 7.5;
        }
        for (let i = 75; i < 90; i += 1) {
            this.increase[i] = 7;
        }
        for (let i = 90; i < 100; i += 1) {
            this.increase[i] = 6.5;
        }
        for (let i = 100; i < 105; i += 1) {
            this.increase[i] = 0;
        }
        for (let i = 105; i < 140; i += 1) {
            this.increase[i] = 6.5;
        }
        for (let i = 140; i < 170; i += 1) {
            this.increase[i] = 6.25;
        }
        for (let i = 170; i < 200; i += 1) {
            this.increase[i] = 5;
        }
        this.increase[200] = 286.4413077949926;
        for (let i = 201; i < 210; i += 1) {
            this.increase[i] = 12;
        }
        this.increase[210] = 60;
        for (let i = 211; i < 215; i += 1) {
            this.increase[i] = 11;
        }
        this.increase[215] = 30;
        for (let i = 216; i < 220; i += 1) {
            this.increase[i] = 9;
        }
        this.increase[220] = 60;
        for (let i = 221; i < 225; i += 1) {
            this.increase[i] = 7;
        }
        this.increase[225] = 30;
        for (let i = 226; i < 230; i += 1) {
            this.increase[i] = 5;
        }
        for (let i = 230; i < 260; i += 1) {
            this.increase[i] = 3;
        }
        this.increase[230] = 60;
        this.increase[235] = 30;
        this.increase[240] = 60;
        this.increase[245] = 30;

        for (let i = 260; i < 275; i += 1) {
            this.increase[i] = 1;
        }
        for (let i = 275; i < 299; i += 1) {
            this.increase[i] = 10;
            if (i % 5 == 0) {
                this.increase[i] = 102;
            }
        }
        this.increase[250] = 60.00000000006373;
        this.increase[260] = 121.512094344923;
        this.increase[270] = 102;
        this.increase[275] = 102;
        this.increase[280] = 102;
        this.increase[285] = 102;
        this.increase[290] = 102;
        this.increase[295] = 102;
        this.increase[299] = 50;

        for (let i = 10; i < 300; i += 1) {
            this.exp = Math.floor(this.exp * (100 + this.increase[i]) / 100);
            this.character[i] = this.exp;
        }
    }

    getPercent(level, exp) {
        return (exp / this.character[level] * 100).toFixed(3);
    }
}

const exp = new Exp();
exp.init();

module.exports = exp;