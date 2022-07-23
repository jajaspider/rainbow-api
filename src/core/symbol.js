const _ = require('lodash');

class Symbol {
    constructor() {
        this.arcane = {
            '1': {
                requireArcaneSymbol: 0,
                journeyMeso: 0,
                chuchuMeso: 0,
                lacheleinMeso: 0,
                afterArcanaMeso: 0,
            }
        };
        this.athentic = {
            '1': {
                requireAthenticSymbol: 0,
                cerniumMeso: 0,
                arcusMeso: 0,
                odiumMeso: 0,
            }
        }
    }

    init() {
        for (let i = 1; i < 20; i += 1) {
            this.arcane[i + 1] = {
                requireArcaneSymbol: Math.pow(i, 2) + 11,
                journeyMeso: 3110000 + 3960000 * i,
                chuchuMeso: 6220000 + 4620000 * i,
                lacheleinMeso: 9330000 + 5280000 * i,
                afterArcanaMeso: 11196000 + 5940000 * i,
            }
        }

        for (let i = 1; i < 11; i += 1) {
            this.athentic[i + 1] = {
                requireAthenticSymbol: Math.pow(i, 2) * 9 + 20 * i,
                cerniumMeso: 96900000 + 88500000 * i,
                arcusMeso: 106600000 + 97300000 * i,
                odiumMeso: 0 + 0 * i,
            }
        }

    }

    getFigure(start, end) {
        let result = {
            requireArcaneSymbol: 0,
            journeyMeso: 0,
            chuchuMeso: 0,
            lacheleinMeso: 0,
            afterArcanaMeso: 0,
        }

        for (let i = start + 1; i <= end; i += 1) {
            let targetArcane = _.get(this.arcane, i);
            result.requireArcaneSymbol += targetArcane.requireArcaneSymbol;
            result.journeyMeso += targetArcane.journeyMeso;
            result.chuchuMeso += targetArcane.chuchuMeso;
            result.lacheleinMeso += targetArcane.lacheleinMeso;
            result.afterArcanaMeso += targetArcane.afterArcanaMeso;
        }

        result.requireAthenticSymbol = 0;
        result.cerniumMeso = 0;
        result.arcusMeso = 0;
        result.odiumMeso = 0;
        for (let i = start + 1; i <= (end > 11 ? 11 : end); i += 1) {
            let targetAthentic = _.get(this.athentic, i);
            result.requireAthenticSymbol += targetAthentic.requireAthenticSymbol;
            result.cerniumMeso += targetAthentic.cerniumMeso;
            result.arcusMeso += targetAthentic.arcusMeso;
            result.odiumMeso += targetAthentic.odiumMeso;
        }

        return result;

    }
}

const symbol = new Symbol();
symbol.init();

module.exports = symbol;
