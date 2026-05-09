const { db } = require('../models/db');

// 에러 전파 래퍼
function wrap(fn) {
  return async (req, res, next) => {
    try {
      await fn(req, res);
    } catch (err) {
      next(err);
    }
  };
}

// 전체 목록 조회 (만료일 오름차순)
const getAll = wrap(async (req, res) => {
  const result = await db.execute(
    'SELECT * FROM legal_inspections ORDER BY due_date ASC'
  );
  res.json({ success: true, data: result.rows, message: '조회 완료' });
});

// 단건 조회
const getOne = wrap(async (req, res) => {
  const { id } = req.params;
  const result = await db.execute(
    'SELECT * FROM legal_inspections WHERE id = ?',
    [id]
  );
  if (!result.rows.length) {
    return res.status(404).json({ success: false, data: null, message: '항목 없음' });
  }
  res.json({ success: true, data: result.rows[0], message: '조회 완료' });
});

// 등록
const create = wrap(async (req, res) => {
  const { inspection_type, due_date, last_date, agency, result: inspResult } = req.body;

  if (!inspection_type || !due_date) {
    return res.status(400).json({ success: false, data: null, message: '검사종류와 만료일은 필수입니다' });
  }
  // 날짜 형식 검증 (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(due_date)) {
    return res.status(400).json({ success: false, data: null, message: '날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)' });
  }

  const r = await db.execute(
    `INSERT INTO legal_inspections (inspection_type, due_date, last_date, agency, result)
     VALUES (?, ?, ?, ?, ?)`,
    [inspection_type, due_date, last_date || null, agency || null, inspResult || null]
  );
  res.status(201).json({ success: true, data: { id: Number(r.lastInsertRowid) }, message: '등록 완료' });
});

// 수정
const update = wrap(async (req, res) => {
  const { id } = req.params;
  const { inspection_type, due_date, last_date, agency, result: inspResult } = req.body;

  if (!inspection_type || !due_date) {
    return res.status(400).json({ success: false, data: null, message: '검사종류와 만료일은 필수입니다' });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(due_date)) {
    return res.status(400).json({ success: false, data: null, message: '날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)' });
  }

  const r = await db.execute(
    `UPDATE legal_inspections
     SET inspection_type = ?, due_date = ?, last_date = ?, agency = ?, result = ?
     WHERE id = ?`,
    [inspection_type, due_date, last_date || null, agency || null, inspResult || null, id]
  );
  if (r.rowsAffected === 0) {
    return res.status(404).json({ success: false, data: null, message: '항목 없음' });
  }
  res.json({ success: true, data: null, message: '수정 완료' });
});

module.exports = { getAll, getOne, create, update };
