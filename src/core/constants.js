const ERROR_CODE = {
  DATA_NOT_FOUND: {
    code: "A0001",
    message: "data not found",
  },
  MISSING_PARAMETER: {
    code: "A0002",
    message: "parameter required",
  },
  INVALID_PARAMETER: {
    code: "A0003",
    message: "invalid parameter",
  },
  UNMEASURABLE: {
    code: "A0004",
    message: "unmeasurable data",
  },
  EXIST_DATA: {
    code: "A0005",
    message: "already exist",
  },

  NEXON_API_FAIL: {
    code: "E0001",
    message: "nexon api error",
  },
};

class RainbowError extends Error {
  constructor(payload) {
    super(payload.error.message);
    this.name = "RainbowError";
    this.httpCode = payload.httpCode;
    this.error = payload.error;
    this.reason = payload.reason;
  }
}

const CURRENCY_LIST = [
  "USD",
  "AED",
  "ARS",
  "AUD",
  "BDT",
  "BRL",
  "CAD",
  "CHF",
  "CLP",
  "CNY",
  "DKK",
  "EGP",
  "EUR",
  "GBP",
  "HKD",
  "HUF",
  "IDR",
  "INR",
  "JPY",
  "KRW",
  "LKR",
  "MNT",
  "MOP",
  "MXN",
  "MYR",
  "NGN",
  "NOK",
  "NPR",
  "NZD",
  "PEN",
  "PHP",
  "PLN",
  "RON",
  "SAR",
  "SEK",
  "SGD",
  "THB",
  "TRY",
  "TWD",
  "UAH",
  "UYU",
  "VND",
  "ZAR",
];

module.exports = {
  ERROR_CODE,
  RainbowError,
  CURRENCY_LIST,
};
