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

### Backend (`backend/`)
Node.js + Express (CommonJS). `@libsql/client` (WASM SQLite — 네이티브 빌드 없이 동작).

- `models/db.js` — libsql 클라이언트 싱글턴 + `initSchema()` (앱 시작 시 `database/schema.sql` 실행)
- `routes/` — Express 라우터. `wrap()` 헬퍼로 async 에러를 미들웨어에 전파
- `controllers/` — 실제 DB 쿼리 + 유효성 검사 로직
- API 응답 형식: `{ success, data, message }`

**libsql 파라미터 쿼리 형식:**
```js
await db.execute({ sql: 'SELECT * FROM t WHERE id = ?', args: [id] });
```

**`wrap()` 패턴 (routes에서 사용):**
```js
router.get('/', wrap(controller.getAll));
// wrap()은 async 함수를 감싸 에러를 next()로 전달
```

### Frontend (`frontend/src/`)
React 18 + Vite + Tailwind CSS (ESM). Vite dev server가 `/api/*` → `http://localhost:4000` 프록시.

- `App.jsx` — 4개 탭 네비게이션 (설비관리, 일상점검, 점검이력, 법정검사). 앱 마운트 시 법정검사 D-day를 계산해 상단 경고 배너 표시.
- **탭 간 이동 패턴**: `onNavigate(tabId, state)` 콜백을 App → 각 Page로 전달. 예: HistoryPage에서 수정 버튼 클릭 시 `onNavigate('daily-check', { editTarget: record })` 호출 → DailyCheckPage가 `initialEditTarget` prop으로 수신.
- `utils/equipment.js` — 설비 종류 목록(`EQUIPMENT_TYPES`), 상태 목록(`EQUIPMENT_STATUSES`), 상태 배지 CSS 헬퍼(`getStatusBadgeClass`)
- `src/index.css` — 공통 컴포넌트 클래스: `.card`, `.btn-primary`, `.btn-secondary`, `.badge-정상` 등

**HTTP 클라이언트**: 설비·일상점검 컴포넌트는 `axios` 사용. 법정검사 컴포넌트는 네이티브 `fetch()` 사용. 새 컴포넌트는 `axios`로 통일.

### Database (`database/`)
`schema.sql`에 4개 테이블 정의:
- `equipments` — 설비 목록 (status 기본값 `'정상'`)
- `daily_checks` — 일상점검 기록 (equipment_id FK, voltage/current/temperature REAL)
- `fault_history` — 이상 이력 (severity 기본값 `'보통'`, resolved 기본값 `0`). **현재 routes/controllers 미구현.**
- `legal_inspections` — 법정검사 일정 (due_date 기준 D-day 계산)

DB 파일(`database/electric.db`)은 서버 첫 실행 시 자동 생성. 수동 초기화 불필요.

## Key Constraints

- **삭제 기능 구현 금지** — 점검 기록은 이력 보존 원칙상 수정만 허용. GET/POST/PUT만 구현.
- **`better-sqlite3` 사용 금지** — Node v24 + 구형 GCC 환경에서 C++20 컴파일 실패. 반드시 `@libsql/client` 사용.
- 모든 주석 **한국어** 작성
- 날짜 형식 `YYYY-MM-DD` 통일
- 전압·전류·온도 입력값은 숫자 유효성 검사 필수 (빈 문자열 → null 변환 허용)
- 컴포넌트 파일명: PascalCase / 함수명: camelCase + 동사 시작

## Implemented Features

| 기능 | 상태 |
|------|------|
| 설비 등록·수정 | ✅ |
| 일상점검 입력·수정·이력조회 | ✅ |
| 법정검사 일정 관리 + D-day 알림 | ✅ |
| 이상 이력 (fault_history) | ✅ |
| PDF 출력 | 🔲 |
| 사용자 로그인/권한 관리 | 🔲 |
