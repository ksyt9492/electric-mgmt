# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# 백엔드 (포트 4000)
cd backend && npm install
cd backend && npm run dev      # nodemon 개발 서버
cd backend && npm start        # 일반 실행

# 프론트엔드 (포트 5173)
cd frontend && npm install
cd frontend && npm run dev     # Vite 개발 서버
cd frontend && npm run build   # 프로덕션 빌드
```

## Architecture

- **Backend**: `backend/` — Node.js + Express (CommonJS), `@libsql/client` (WASM 기반 SQLite, 네이티브 빌드 불필요)
  - `models/db.js` — libsql 클라이언트 생성 + `initSchema()` (앱 시작 시 schema.sql 적용)
  - `controllers/` — async 함수, `routes/` 에서 `wrap()` 헬퍼로 에러 전파
  - API 응답 통일 형식: `{ success, data, message }`
- **Frontend**: `frontend/` — React 18 + Vite + Tailwind CSS (ESM)
  - Vite dev server가 `/api/*` 를 `localhost:4000` 으로 프록시 (`vite.config.js`)
  - 색상 테마: `navy-*` (다크 네이비) + `accent-*` (노란색), `src/index.css` 에 공통 컴포넌트 클래스 정의
  - `utils/equipment.js` — 설비종류·상태 상수, 배지 클래스 헬퍼
- **Database**: `database/schema.sql` + `database/electric.db` (런타임 생성)

## Key Constraints

- 점검 기록 **삭제 기능 구현 금지** (이력 보존 원칙 — 수정만 허용)
- 모든 주석 **한국어** 작성
- 날짜 형식 `YYYY-MM-DD` 통일
- 전압/전류/온도 입력값 숫자 유효성 검사 필수
- `better-sqlite3` 사용 금지 — Node v24 + 구형 GCC 환경에서 C++20 컴파일 실패함. `@libsql/client` 사용
# ⚡ 전기 수변전설비 관리 시스템 (Electric Substation Management System)

## 📌 프로젝트 개요

요양병원·아파트 등 시설의 수변전설비(수전설비, 변압기, 차단기, 배전반 등)를
체계적으로 점검·기록·관리하는 웹 기반 관리 프로그램.

- **주요 사용자**: 시설관리자, 전기담당자 (전기산업기사 보유자)
- **목적**: 일상점검, 정기점검 기록 / 이상 이력 추적 / 법정검사 일정 관리

---

## 🛠️ 기술 스택

- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Node.js (Express) 또는 Python (FastAPI)
- **Database**: SQLite (소규모) / PostgreSQL (확장 시)
- **인증**: JWT 토큰 기반 로그인
- **배포**: 로컬 서버 or GitHub Pages (정적 빌드 시)

---

## 📁 프로젝트 폴더 구조

```
electric-mgmt/
├── frontend/
│   ├── src/
│   │   ├── components/      # 재사용 UI 컴포넌트
│   │   ├── pages/           # 화면 단위 페이지
│   │   ├── utils/           # 날짜 계산, 유효성 검사 등
│   │   └── data/            # 설비 목록 초기 데이터
│   └── public/
├── backend/
│   ├── routes/              # API 라우터
│   ├── models/              # DB 모델 정의
│   └── controllers/         # 비즈니스 로직
├── database/
│   └── schema.sql           # 테이블 설계
├── docs/
│   └── 점검표양식.md        # 참고 서류
└── CLAUDE.md
```

---

## ⚡ 핵심 기능 목록

### 1. 설비 등록 및 관리
- 수전설비, 변압기, 차단기(ACB/VCB/MCCB), 배전반, 콘덴서 등록
- 설비별 제원(용량, 제조사, 설치일, 내용연수) 입력
- 설비 상태: 정상 / 주의 / 불량 / 교체필요

### 2. 일상점검 기록
- 매일/매주 점검 체크리스트 입력
- 전압(V), 전류(A), 온도(℃), 누설전류 수기 입력
- 이상 발생 시 사진 첨부 + 특이사항 메모

### 3. 정기점검 관리
- 월간/분기/연간 점검 일정 캘린더
- 법정검사 만료일 D-day 알림 (전기안전점검, 정기검사)
- 점검 결과 PDF 출력 기능

### 4. 이상 이력 관리
- 고장/이상 발생 기록 (일시, 원인, 조치내용, 담당자)
- 이력 검색 및 필터 (날짜, 설비명, 심각도)

### 5. 대시보드
- 설비 현황 요약 (정상/주의/불량 현황)
- 이번 달 점검 완료율
- 곧 만료되는 법정검사 목록

---

## 💻 자주 쓰는 명령어

```bash
# 프론트엔드 실행
cd frontend && npm run dev

# 백엔드 실행
cd backend && npm start
# 또는 Python이라면
cd backend && uvicorn main:app --reload

# 빌드
cd frontend && npm run build

# 의존성 설치
npm install

# DB 초기화 (SQLite)
node backend/init-db.js
```

---

## 🗄️ 주요 DB 테이블 설계

```sql
-- 설비 목록
equipments (id, name, type, capacity, manufacturer, install_date, location, status)

-- 일상점검 기록
daily_checks (id, equipment_id, check_date, voltage, current, temperature, memo, checker)

-- 이상 이력
fault_history (id, equipment_id, fault_date, description, action_taken, severity, resolved)

-- 법정검사 일정
legal_inspections (id, inspection_type, due_date, last_date, agency, result)
```

---

## 🎨 UI/UX 규칙

- 색상: 전기/산업 느낌의 **다크 네이비 + 노란색 포인트** 사용
- 폰트: `Noto Sans KR` (한국어 가독성 우선)
- 모바일 반응형 필수 (현장에서 스마트폰으로 점검 입력)
- 점검 입력 화면은 **큰 버튼, 큰 글씨** (장갑 낀 손으로도 사용 가능하게)
- 테이블 목록은 행 클릭 시 상세보기 열림

---

## ✅ 코딩 규칙

- 모든 주석은 **한국어**로 작성
- 날짜 형식: `YYYY-MM-DD` 통일
- 전압/전류/온도 입력값은 반드시 숫자 유효성 검사
- API 응답 형식 통일:
  ```json
  { "success": true, "data": {...}, "message": "처리완료" }
  ```
- 컴포넌트 파일명: PascalCase (예: `DailyCheckForm.jsx`)
- 함수명: camelCase + 동사 시작 (예: `fetchEquipmentList`, `saveCheckRecord`)

---

## 🚫 절대 금지사항

- `.env` 파일 절대 Git 커밋 금지 (DB 비밀번호, API 키 포함)
- `node_modules/` 폴더 수정 금지
- 점검 기록 삭제 기능 구현 금지 (이력 보존 원칙 — 수정만 허용)
- 법정검사 만료일 임의 변경 금지 (반드시 실제 검사 후 갱신)
- 관리자 계정 정보 하드코딩 금지

---

## 📋 전기설비 용어 참고

| 약어 | 의미 |
|------|------|
| ACB | Air Circuit Breaker (기중차단기) |
| VCB | Vacuum Circuit Breaker (진공차단기) |
| MCCB | Molded Case Circuit Breaker (배선용차단기) |
| TR | Transformer (변압기) |
| DS | Disconnecting Switch (단로기) |
| LA | Lightning Arrester (피뢰기) |
| PF | Power Fuse |
| MOF | Metering Out Fit (계기용변성기함) |
| CB | Circuit Breaker (차단기) |
| UPS | Uninterruptible Power Supply (무정전전원장치) |

---

## 📞 참고 법규 및 기준

- 전기사업법 제63조 (전기설비 유지·관리 의무)
- 전기안전관리법 시행규칙 별표 (정기검사 주기)
- 의료법 시행규칙 (요양병원 전기설비 기준)
- KEC (한국전기설비규정) 적용

---

## 🔧 개발 우선순위

1. ✅ DB 스키마 및 설비 등록 화면
2. ✅ 일상점검 입력 폼
3. ✅ 점검 이력 조회 테이블
4. 🔲 법정검사 D-day 알림
5. 🔲 PDF 출력 기능
6. 🔲 사용자 로그인/권한 관리
