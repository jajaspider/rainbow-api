const _ = require("lodash");

class Symbol {
  constructor() {
    this.arcane = {
      1: {
        requireArcaneSymbol: 0,
        journeyMeso: 0,
        chuchuMeso: 0,
        lacheleinMeso: 0,
        arcanaMeso: 0,
        morassMeso: 0,
        esferaMeso: 0,
      },
    };
    this.athentic = {
      1: {
        requireAthenticSymbol: 0,
        cerniumMeso: 0,
        arcusMeso: 0,
        odiumMeso: 0,
        shangriLaMeso: 0,
      },
    };
  }

  init() {
    for (let i = 1; i < 20; i += 1) {
      this.arcane[i + 1] = {
        requireArcaneSymbol: Math.pow(i, 2) + 11,
        journeyMeso:
          Math.floor(Math.pow(i, 3) * 0.1 + Math.pow(i, 2) * 8 + i * 1.1 + 88) *
          10000,
        chuchuMeso:
          Math.floor(
            Math.pow(i, 3) * 0.1 + Math.pow(i, 2) * 10 + i * 1.1 + 110
          ) * 10000,
        lacheleinMeso:
          Math.floor(
            Math.pow(i, 3) * 0.1 + Math.pow(i, 2) * 12 + i * 1.1 + 132
          ) * 10000,
        arcanaMeso:
          Math.floor(
            Math.pow(i, 3) * 0.1 + Math.pow(i, 2) * 14 + i * 1.1 + 154
          ) * 10000,
        morassMeso:
          Math.floor(
            Math.pow(i, 3) * 0.1 + Math.pow(i, 2) * 16 + i * 1.1 + 176
          ) * 10000,
        esferaMeso:
          Math.floor(
            Math.pow(i, 3) * 0.1 + Math.pow(i, 2) * 18 + i * 1.1 + 198
          ) * 10000,
      };
    }

    for (let i = 1; i < 11; i += 1) {
      this.athentic[i + 1] = {
        requireAthenticSymbol: Math.pow(i, 2) * 9 + 20 * i,
        cerniumMeso:
          Math.floor(Math.pow(i, 3) * -5.4 + Math.pow(i, 2) * 106.8 + i * 264) *
          100000,
        arcusMeso:
          Math.floor(Math.pow(i, 3) * -5.4 + Math.pow(i, 2) * 123 + i * 300) *
          100000,
        odiumMeso:
          Math.floor(Math.pow(i, 3) * -5.4 + Math.pow(i, 2) * 139.2 + i * 336) *
          100000,
        shangriLaMeso:
          Math.floor(Math.pow(i, 3) * -5.4 + Math.pow(i, 2) * 155.4 + i * 372) *
          100000,
      };
    }
  }

  getFigure(start, end) {
    let result = {
      requireArcaneSymbol: 0,
      journeyMeso: 0,
      chuchuMeso: 0,
      lacheleinMeso: 0,
      arcanaMeso: 0,
      morassMeso: 0,
      esferaMeso: 0,
      requireAthenticSymbol: 0,
      cerniumMeso: 0,
      arcusMeso: 0,
      odiumMeso: 0,
      shangriLaMeso: 0,
    };

    for (let i = start + 1; i <= end; i += 1) {
      let targetArcane = _.get(this.arcane, i);
      result.requireArcaneSymbol += targetArcane.requireArcaneSymbol;
      result.journeyMeso += targetArcane.journeyMeso;
      result.chuchuMeso += targetArcane.chuchuMeso;
      result.lacheleinMeso += targetArcane.lacheleinMeso;
      result.arcanaMeso += targetArcane.arcanaMeso;
      result.morassMeso += targetArcane.morassMeso;
      result.esferaMeso += targetArcane.esferaMeso;
    }

    for (let i = start + 1; i <= (end > 11 ? 11 : end); i += 1) {
      let targetAthentic = _.get(this.athentic, i);
      result.requireAthenticSymbol += targetAthentic.requireAthenticSymbol;
      result.cerniumMeso += targetAthentic.cerniumMeso;
      result.arcusMeso += targetAthentic.arcusMeso;
      result.odiumMeso += targetAthentic.odiumMeso;
      result.shangriLaMeso += targetAthentic.shangriLaMeso;
    }

    return result;
  }
}

const symbol = new Symbol();
symbol.init();

module.exports = symbol;
