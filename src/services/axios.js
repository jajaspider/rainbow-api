const axios = require("axios");

axios.default.paramsSerializer = (params) => {
  return qs.stringify(params);
};

module.exports = axios;
