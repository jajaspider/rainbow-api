const ERROR_CODE = {
  DATA_NOT_FOUND: {
    code: "A0001",
    message: "data not found",
  },
  MISSING_PARAMETER: {
    code: "A0002",
    message: "parameter required",
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
