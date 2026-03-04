# Cafe24 Migration Validator

Cafe24 마이그레이션용 CSV 파일을 **로컬 CLI**로 검증하는 TypeScript 프로젝트입니다.

현재 구현 범위:
- 회원(member)
- 주문(order)

출력 결과:
- `errors.csv`
- `warnings.csv`
- `summary.json`

---

## 실행 방법
**처음 실행**
```
yarn install
yarn build
yarn validate -- --type member --input ./input/member.csv --out ./reports/member
yarn validate -- --type order --input ./input/order.csv --out ./reports/order
```

**yarn 명령이 실행 불가능 할 경우**
```
corepack enable
corepack prepare yarn@stable --activate
yarn -v
```

인코딩에 문제가 있을 경우



---

## 1차 검증 실행
회원
```
yarn dev --type member --input ./input/member.work.csv --out ./reports/member-1st
```

주문
```
yarn dev --type order --input ./input/order.work.csv --out ./reports/order-1st
```
---

## 결과 확인
실행이 끝나면 eports/... 아래에 3개 파일이 생성
 - errors.csv
 - warnings.csv
 - summary.json

### 분석

**Summary.json**
여기서 전체 규모 확인
 - totalRows: 데이터 행 수(헤더 제외)
 - validRows: 에러가 없는 행 수
 - errorRows: 에러가 하나 이상 있는 행 수
 - warningRows: 경고가 하나 이상 있는 행 수
 - errorCount: 전체 에러 개수
 - warningCount: 전체 경고 개수

errorRows가 0이 되도록 먼저 맞추고, 그 다음 warnings.csv를 정리.

**errors.csv, warings.csv**
예제
- datasetType
- rowNumber
- columnIndex
- columnName
- severity
- code
- message
- rawValue
- normalizedValue

예를 들어:
  - rowNumber = 245
  - columnName = 이메일
  - code = INVALID_EMAIL
  - rawValue = abc@aaa.com
이면,

원본 CSV의 245행, 이메일 컬럼에 있는 값 abc@aaa.com이 규칙 위반이라는 뜻.


### 행 번호를 찾는 방법
**rowNumber 기준**
 - 헤더가 1행
 - 첫 번째 데이터는 2행

즉, 리포트의 rowNumber는 원본 CSV의 실제 줄 번호처럼 보면 된다.

예:
 - rowNumber = 1 → 헤더 문제
 - rowNumber = 2 → 첫 데이터 행
 - rowNumber = 345 → 원본 CSV의 345행

### 수정 대상
errors.csv를 수정하는 게 아니라, 원본 입력 파일을 수정해야 함.
 - 틀린 파일: ./input/member.work.csv
 - 참고 리포트: ./reports/member-1st/errors.csv

---

## 수정 방법
1) 원본 CSV + errors.csv를 나란히 열기

 - member.work.csv 열기
 - reports/member-1st/errors.csv 열기
 - errors.csv에서 rowNumber, columnName, message 확인
 - 원본 파일에서 해당 셀 수정
 - 저장
 - 다시 검증

2) errors.csv를 기준으로 필터링
 - code 기준 정렬
   또는 columnName 기준 정렬
   또는 rowNumber 오름차순 정렬
위 방식은 같은 유형의 오류를 한 번에 처리하기 쉬움

예:
 - INVALID_EMAIL만 먼저 수정
 - INVALID_PHONE만 다음에 수정
 - REQUIRED_FIELD_EMPTY 마지막 정리

**주의사항**
원본 CSV를 정렬하면 **rowNumber가 바뀌**므로 이 점 유의해야 함.

---

## .csv 파일 오류 수정 방법

### Excel 자동 변환 주의
아래 컬럼은 엑셀에서 자동 변형되기 쉽습니다.
 - 주문번호
 - 품목코드
 - 우편번호
 - 전화번호
 - 사업자번호
 - 법인번호
 - 외국인등록번호
이런 값은 텍스트처럼 다루는 습관이 좋음. Microsoft도 CSV를 열 때 기본 데이터 형식으로 자동 해석될 수 있고, 앞자리 0 같은 값은 텍스트로 가져오거나 텍스트 형식으로 유지해야 보존된다고 안내함.

### 구분자가 쉼표가 아닐 때
기본은 ,
**세미콜론 CSV**
```
yarn dev --type member --input ./input/member.csv --delimiter ";"
```
**탭 구분 파일**
```
yarn dev --type order --input ./input/order.tsv --delimiter "\t"
```

### 인코딩에 문제가 있는 경우
이 경우 입력파일이 CP949일 가능성이 큼.
```
yarn dev --type member --input ./input/member.csv --out ./reports/member --encoding cp949
```
또는
```
yarn dev --type order --input ./input/order.csv --out ./reports/order --encoding euc-kr
```

---

## Validator 실행 순서 
### 회원
첫 검증
```
yarn dev --type member --input ./input/member.work.csv --out ./reports/member-1st
```
1차 수정 후 재 검증(2차)
```
yarn dev --type member --input ./input/member.work.csv --out ./reports/member-2nd
```
최종 확인
```
yarn dev --type member --input ./input/member.work.csv --out ./reports/member-final --strict-email-domain
```

### 주문
첫 검증
```
yarn dev --type order --input ./input/order.work.csv --out ./reports/order-1st
```
수정 후
```
yarn dev --type order --input ./input/order.work.csv --out ./reports/order-final
```

---

## 이번 튜닝에서 반영한 내용

- 사용자가 전달한 **Cafe24 표준 헤더명** 기준으로 회원/주문 preset 정리
- 회원 헤더의 `총적립금`, `평생회원 여부`, `평생회원 전환일` 반영
- 주문 헤더의 `결제수단` 반영
- **표준 헤더 템플릿 CSV** 추가
  - `templates/member.headers.csv`
  - `templates/order.headers.csv`
- 인식되지 않는 헤더 발견 시 `UNRECOGNIZED_HEADER` 경고 출력
- 헤더 오류가 `summary.json`의 `errorRows`, `warningRows`, `validRows`를 왜곡하지 않도록 수정
- `가입경로` 공란일 때 `PC` 기본 처리 가능성 경고 추가

> `룰별 on/off 설정 JSON`은 이번 단계에서는 넣지 않았습니다.
> 그 기능은 특정 룰을 파일로 끄고 켜는 옵션인데, 지금은 회원/주문 기본 검증을 먼저 안정화하는 것이 우선이라 제외했습니다.

---

## 폴더 구조

```text
migration-validator/
  templates/
    member.headers.csv
    order.headers.csv
  samples/
    member.sample.csv
    order.sample.csv
  reports/
  src/
    cli/
      index.ts
    core/
      csv/
        csvRecordParser.ts
        streamCsvFile.ts
      engine/
        columnResolver.ts
        runValidation.ts
      report/
        IssueCsvWriter.ts
        SummaryTracker.ts
        writeSummary.ts
      utils/
        dateUtils.ts
        domainUtils.ts
        pathUtils.ts
        stringUtils.ts
        valueUtils.ts
      validators/
        commonValidators.ts
      types.ts
    presets/
      index.ts
      memberPreset.ts
      orderPreset.ts
  package.json
  tsconfig.json
  README.md
```

---

## 설치

```bash
yarn install
```

또는

```bash
npm install
```

---

## 실행

### 개발 실행

회원 CSV 검증:

```bash
yarn dev --type member --input ./input/member.csv --out ./reports/member
```

주문 CSV 검증:

```bash
yarn dev --type order --input ./input/order.csv --out ./reports/order
```

### 빌드 후 실행

```bash
yarn build
yarn validate -- --type member --input ./input/member.csv --out ./reports/member
yarn validate -- --type order --input ./input/order.csv --out ./reports/order
```

---

## 옵션

- `--type` : `member` | `order`
- `--input` : 입력 CSV 파일 경로
- `--out` : 리포트 디렉터리 경로
- `--encoding` : 기본 `utf8`, 필요 시 `cp949`, `euc-kr`
- `--delimiter` : 기본 `,`, 탭 구분자는 `\t`
- `--strict-email-domain` : 이메일 도메인 DNS 검사 활성화

예시:

```bash
yarn dev --type member --input ./input/member.csv --encoding cp949 --strict-email-domain
```

---

## 표준 헤더 템플릿

회원 표준 헤더:
- `templates/member.headers.csv`

주문 표준 헤더:
- `templates/order.headers.csv`

실제 운영 CSV를 만들 때는 이 템플릿 헤더를 그대로 복사해서 쓰는 것을 권장합니다.

---

## 현재 구현된 대표 규칙

### 회원
- 아이디 형식
- 아이디 중복
- 이름 형식/길이
- 이메일 형식
- 휴대폰/전화번호 형식
- 생년월일/회원가입일/탈퇴일 등 날짜 형식
- 우편번호 형식
- 주소(동/읍/면), 주소(번지미만)
- 총적립금/총예치금 금액 형식
- 탈퇴여부/탈퇴일 연관성
- 생년월일/나이 불일치 경고
- 평생회원 여부/전환일 경고
- 가입경로 공란 시 기본값 경고

### 주문
- 주문번호 형식
- 품목코드 형식/중복
- 주문일시 형식
- 주문자/수령인 이름
- 전화번호 형식
- 주문자아이디/이메일
- 주소/우편번호
- 수량/금액 형식
- 결제구분 형식
- 품목코드 누락 경고
- 주문자아이디 누락 경고
- 금액/수량 공란 시 기본값 경고

---

## 결과 파일 예시

### `errors.csv`
- 어느 행인지
- 어느 컬럼인지
- 어떤 룰을 위반했는지
- 원본값 / 정규화 제안값

### `warnings.csv`
- 자동 보정 가능성
- 기본값 처리 가능성
- 운영상 주의가 필요한 항목

### `summary.json`
- 전체 행 수
- 오류 행 수
- 경고 행 수
- 룰별 발생 횟수
- 헤더 이슈 수

---