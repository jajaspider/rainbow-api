function run() {
  var script = document.createElement("script");
  script.async = 1;
  script.src = "https://5999.kr/api/script/tmon_payment.js";
  script.charset = "UTF-8";
  document.getElementsByTagName("body")[0].appendChild(script);
}
run();
