-- 설비 목록
CREATE TABLE IF NOT EXISTS equipments (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT    NOT NULL,               -- 설비명
  type            TEXT    NOT NULL,               -- 설비종류 (변압기, ACB, VCB 등)
  capacity        TEXT,                           -- 용량 (예: 500kVA, 800A)
  manufacturer    TEXT,                           -- 제조사
  install_date    TEXT,                           -- 설치일 (YYYY-MM-DD)
  location        TEXT,                           -- 설치위치
  status          TEXT    NOT NULL DEFAULT '정상', -- 정상 / 주의 / 불량 / 교체필요
  created_at      TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- 일상점검 기록
CREATE TABLE IF NOT EXISTS daily_checks (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  equipment_id INTEGER NOT NULL,
  check_date   TEXT    NOT NULL,
  voltage      REAL,
  current      REAL,
  temperature  REAL,
  memo         TEXT,
  checker      TEXT,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (equipment_id) REFERENCES equipments(id)
);

-- 이상 이력
CREATE TABLE IF NOT EXISTS fault_history (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  equipment_id  INTEGER NOT NULL,
  fault_date    TEXT    NOT NULL,
  description   TEXT    NOT NULL,
  action_taken  TEXT,
  severity      TEXT    NOT NULL DEFAULT '보통', -- 경미 / 보통 / 심각
  resolved      INTEGER NOT NULL DEFAULT 0,      -- 0: 미처리, 1: 처리완료
  created_at    TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (equipment_id) REFERENCES equipments(id)
);

-- 법정검사 일정
CREATE TABLE IF NOT EXISTS legal_inspections (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  inspection_type TEXT    NOT NULL,  -- 전기안전점검 / 정기검사 등
  due_date        TEXT    NOT NULL,  -- 만료일 (YYYY-MM-DD)
  last_date       TEXT,              -- 최종검사일 (YYYY-MM-DD)
  agency          TEXT,              -- 검사 기관
  result          TEXT,              -- 합격 / 불합격 / 조건부합격
  created_at      TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);
