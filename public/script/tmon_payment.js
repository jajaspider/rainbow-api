if (inputString == null) {
  var inputString = prompt(
    '찾을 PG를 입력하세요.\n1. NHN, 2. 케이지이니시스, 3. 한국정보통신, 4. 토스페이먼츠\nex) "1,2"를 입력하면 NHN과 케이지이니시스를 찾기'
  );

  if (inputSplit == null) {
    var inputSplit = inputString.split(",");
  }
}

function run() {
  if (inputSplit.length == 0) {
    return;
  }

  let termsElement = document.getElementsByClassName("_pay_terms_layer");
  termsElement = termsElement[0];
  termsElement.click();

  let termsDetailElement = document.getElementsByClassName("pop_by_proxy");
  termsDetailElement = termsDetailElement[0];

  let termsDetail = termsDetailElement.innerHTML;
  console.dir(termsDetail);
  console.dir(inputSplit);
  console.dir(
    termsDetail.includes("https://pay.tmon.co.kr/terms/KCP2") &&
      inputSplit.includes("1")
  );
  //
  if (
    termsDetail.includes("https://pay.tmon.co.kr/terms/KICC") &&
    inputSplit.includes("3")
  ) {
    alert("한국정보통신");
    inputSplit = inputSplit.filter((input) => {
      if (input != "3") {
        return input;
      }
    });
    return;
  }
  //
  else if (
    termsDetail.includes("https://pay.tmon.co.kr/terms/KCP2") &&
    inputSplit.includes("1")
  ) {
    alert("엔에이치엔한국사이버결제");
    inputSplit = inputSplit.filter((input) => {
      if (input != "1") {
        return input;
      }
    });
    return;
  }
  //
  else if (
    termsDetail.includes("https://pay.tmon.co.kr/terms/INICIS") &&
    inputSplit.includes("2")
  ) {
    alert("케이지이니시스");
    inputSplit = inputSplit.filter((input) => {
      if (input != "2") {
        return input;
      }
    });
    return;
  }
  //
  else if (
    termsDetail.includes("https://pay.tmon.co.kr/terms/LGU") &&
    inputSplit.includes("4")
  ) {
    alert("토스페이먼츠");
    inputSplit = inputSplit.filter((input) => {
      if (input != "4") {
        return input;
      }
    });
    return;
  }
  //
  else {
  }

  let tmonUrl = document.referrer;

  var myScript = document.createElement("script");
  myScript.type = "text/javascript";
  myScript.src = "http://localhost:30001/api/script/my_script.js";

  $.ajax({
    url: tmonUrl,
    type: "GET",
    success: function (data) {
      $("body").html(data);
      $("body").append(myScript);
      setTimeout(run, 2000);
    },
    error: function () {
      console.error("요청에 실패했습니다.");
    },
  });
}

run();
