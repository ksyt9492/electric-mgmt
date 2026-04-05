const { createClient } = require('@libsql/client');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../database/electric.db');
const SCHEMA_PATH = path.join(__dirname, '../../database/schema.sql');

// libsql 로컬 파일 클라이언트
const db = createClient({ url: `file:${DB_PATH}` });

// 스키마 적용 (비동기, 앱 시작 시 한 번 실행)
async function initSchema() {
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  // 세미콜론으로 구분된 각 statement를 순서대로 실행
  const statements = schema
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    await db.execute(stmt);
  }
}

module.exports = { db, initSchema };
