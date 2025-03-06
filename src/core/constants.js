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

const WHITE_LIST = [
  "컬쳐랜드",
  "Google Play",
  "L.POINT",
  "엘포인트",
  "국민관광상품권",
  "롯데모바일상품권",
  "H.Point",
  "현대백화점",
  "머니트리",
  "배달의민족",
  "센골드",
  "신세계백화점",
  "신세계상품권",
  "요기요 상품권",
  "티몬캐시",
  "[PAYCO]",
  "북앤라이프",
  "도서문화",
  "온라인문화상품권",
  "온라인 문화상품권",
  "컬쳐랜드 상품권",
  "해피머니",
  "[문화상품권]",
  "교통페이",
  "컬쳐캐쉬",
  "에그머니",
];

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
  WHITE_LIST,
};
