const { db } = require('../models/db');

// 일상점검 목록 조회 (설비명 JOIN)
async function getAll(req, res) {
  const { equipment_id, date_from, date_to, checker, has_memo } = req.query;

  let sql = `
    SELECT dc.*, eq.name AS equipment_name, eq.type AS equipment_type
    FROM daily_checks dc
    JOIN equipments eq ON eq.id = dc.equipment_id
  `;
  const args = [];
  const conditions = [];

  if (equipment_id) {
    conditions.push('dc.equipment_id = ?');
    args.push(equipment_id);
  }
  if (date_from) {
    conditions.push('dc.check_date >= ?');
    args.push(date_from);
  }
  if (date_to) {
    conditions.push('dc.check_date <= ?');
    args.push(date_to);
  }
  if (checker) {
    conditions.push('dc.checker LIKE ?');
    args.push(`%${checker}%`);
  }
  if (has_memo === 'true') {
    conditions.push("dc.memo IS NOT NULL AND dc.memo != ''");
  }
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  sql += ' ORDER BY dc.check_date DESC, dc.created_at DESC';

  const result = await db.execute({ sql, args });
  res.json({ success: true, data: result.rows, message: '조회완료' });
}

// 일상점검 등록
async function create(req, res) {
  const { equipment_id, check_date, voltage, current, temperature, memo, checker } = req.body;

  if (!equipment_id || !check_date) {
    return res.status(400).json({ success: false, data: null, message: '설비와 점검일은 필수입니다' });
  }

  // 숫자 유효성 검사
  for (const [field, val] of [['전압', voltage], ['전류', current], ['온도', temperature]]) {
    if (val !== undefined && val !== null && val !== '' && isNaN(Number(val))) {
      return res.status(400).json({ success: false, data: null, message: `${field} 값은 숫자여야 합니다` });
    }
  }

  const result = await db.execute({
    sql: `INSERT INTO daily_checks (equipment_id, check_date, voltage, current, temperature, memo, checker)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      equipment_id,
      check_date,
      voltage !== '' ? Number(voltage) : null,
      current !== '' ? Number(current) : null,
      temperature !== '' ? Number(temperature) : null,
      memo || null,
      checker || null,
    ],
  });

  const created = await db.execute({
    sql: `SELECT dc.*, eq.name AS equipment_name, eq.type AS equipment_type
          FROM daily_checks dc
          JOIN equipments eq ON eq.id = dc.equipment_id
          WHERE dc.id = ?`,
    args: [Number(result.lastInsertRowid)],
  });
  res.status(201).json({ success: true, data: created.rows[0], message: '점검 기록이 저장되었습니다' });
}

// 일상점검 수정 (삭제 금지 — 수정만 허용)
async function update(req, res) {
  const existing = await db.execute({
    sql: 'SELECT * FROM daily_checks WHERE id = ?',
    args: [req.params.id],
  });
  if (existing.rows.length === 0) {
    return res.status(404).json({ success: false, data: null, message: '점검 기록을 찾을 수 없습니다' });
  }
  const row = existing.rows[0];

  const { check_date, voltage, current, temperature, memo, checker } = req.body;

  // 숫자 유효성 검사
  for (const [field, val] of [['전압', voltage], ['전류', current], ['온도', temperature]]) {
    if (val !== undefined && val !== null && val !== '' && isNaN(Number(val))) {
      return res.status(400).json({ success: false, data: null, message: `${field} 값은 숫자여야 합니다` });
    }
  }

  await db.execute({
    sql: `UPDATE daily_checks
          SET check_date = ?, voltage = ?, current = ?, temperature = ?, memo = ?, checker = ?
          WHERE id = ?`,
    args: [
      check_date ?? row.check_date,
      voltage !== undefined ? (voltage !== '' ? Number(voltage) : null) : row.voltage,
      current !== undefined ? (current !== '' ? Number(current) : null) : row.current,
      temperature !== undefined ? (temperature !== '' ? Number(temperature) : null) : row.temperature,
      memo !== undefined ? memo || null : row.memo,
      checker !== undefined ? checker || null : row.checker,
      req.params.id,
    ],
  });

  const updated = await db.execute({
    sql: `SELECT dc.*, eq.name AS equipment_name, eq.type AS equipment_type
          FROM daily_checks dc
          JOIN equipments eq ON eq.id = dc.equipment_id
          WHERE dc.id = ?`,
    args: [req.params.id],
  });
  res.json({ success: true, data: updated.rows[0], message: '점검 기록이 수정되었습니다' });
}

module.exports = { getAll, create, update };
