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

module.exports = {
  ERROR_CODE,
  RainbowError,
};
