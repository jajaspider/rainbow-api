### 최종수정 : 2022년 9월 04일

## 버전 : 1.0.0

## 패치노트
- 2022.08.29 : maplestory info api에 월드 아이콘 데이터 추가, lostark 분배 계산을 위한 api 지원
- 2022.08.22 : lostark info api의 보석 데이터에 스킬 이름 추가, 캐릭터 정보에 보석이 없는 경우에 대한 error 처리, 보유 캐릭터 정보 중 - 아이템 레벨 데이터 추가
- 2022.08.21 : lostark info api에 수집물, 보석 데이터 추가
- 2022.07.23 : maplestory 심볼 api 지원(오디움 제외)
- 2022.06.27 : iamge delete api 지원
- 2022.06.23 : maplestory, lostark 이벤트 리스트 api 지원
- 2022.06.23 : lostark notice title중 "새 글"이 포함되어있는 경우 제거, 메이플스토리 유니온 정보 api 지원
- 2022.06.18 : 메이플스토리 랜덤 직업선택 api 지원
- 2022.03.06 : 폴링데이터 최신화 확인, image api 지원
- 2022.03.05 : lostark와 maplestory의 홈페이지를 폴링하여 변경점을 mq에 삽입하는 서비스 지원
- 2022.02.19 : 경험치 api를 통해 성장의 비약을 활용한 상승폭 api 지원, 사용 불가능한 레벨 check
- 2022.02.12 : error return에 대한 payload 변경
- 2022.02.07 : 스타포스 데이터 api 지원
- 2022.02.06 : 메이플스토리 캐릭터 정보의 무릉,시드 기록데이터 default값 적용
- 2022.02.05 : 메이플스토리 캐릭터 정보, 로스트아크 캐릭터정보, 보유캐릭터 현황, 크리스탈 지수 api 지원
- 2022.01.16 : 뭐먹지, 뭐하지,vs, 채널 지원

## api list
- selection
  - 뭐먹지
  - 뭐하지
  - 채널
  - 메이플스토리 직업(1차 분류까지 가능)
- maplestory
  - info
  - starforce
  - growth(exp)
  - union info
  - event info
  - symbol calc
- lostark
  - info
  - crystal
  - expand info
  - event info
  - distribute
- image

##
- !렙반감
- !무릉히스토리
- !농장 (목록, 조합식) (몬스터 명)
- !녜힁 (길이)
- !썬데이
- 확률 컨텐츠
  - !로얄스타일 (횟수)
  - 골드애플 (횟수)
  - 원더베리 (횟수)
  - 루나크리스탈 (횟수)
  - 루나크리스탈스윗 (횟수)
- !보스 (보스명) (난이도)

##
- !모험섬
- !경매장
- !거래소
- !보스