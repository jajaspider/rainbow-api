const { ERROR_CODE, RainbowError } = require("../core/constants");

async function characterLength(req, res, next) {
  if (req.params.name.length > 6) {
    return res
      .status(400)
      .send(
        `${ERROR_CODE.INVALID_PARAMETER.message} : Character name cannot be longer than 6 characters.`
      );
  }
  next();
}

module.exports = {
  characterLength,
};
