const { db } = require('../models/db');

const SEVERITIES = ['경미', '보통', '심각'];

// 이상 이력 목록 조회 (설비명 JOIN, 다중 필터 지원)
async function getAll(req, res) {
  const { equipment_id, severity, resolved, date_from, date_to } = req.query;

  let sql = `
    SELECT fh.*, eq.name AS equipment_name, eq.type AS equipment_type
    FROM fault_history fh
    JOIN equipments eq ON eq.id = fh.equipment_id
  `;
  const args = [];
  const conditions = [];

  if (equipment_id) {
    conditions.push('fh.equipment_id = ?');
    args.push(equipment_id);
  }
  if (severity) {
    conditions.push('fh.severity = ?');
    args.push(severity);
  }
  if (resolved !== undefined && resolved !== '') {
    conditions.push('fh.resolved = ?');
    args.push(Number(resolved));
  }
  if (date_from) {
    conditions.push('fh.fault_date >= ?');
    args.push(date_from);
  }
  if (date_to) {
    conditions.push('fh.fault_date <= ?');
    args.push(date_to);
  }
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  sql += ' ORDER BY fh.fault_date DESC, fh.created_at DESC';

  const result = await db.execute({ sql, args });
  res.json({ success: true, data: result.rows, message: '조회완료' });
}

// 이상 이력 등록
async function create(req, res) {
  const { equipment_id, fault_date, description, action_taken, severity, resolved } = req.body;

  if (!equipment_id || !fault_date || !description) {
    return res.status(400).json({ success: false, data: null, message: '설비, 발생일, 이상내용은 필수입니다' });
  }
  if (severity && !SEVERITIES.includes(severity)) {
    return res.status(400).json({ success: false, data: null, message: '심각도는 경미/보통/심각 중 하나여야 합니다' });
  }

  const result = await db.execute({
    sql: `INSERT INTO fault_history (equipment_id, fault_date, description, action_taken, severity, resolved)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      equipment_id,
      fault_date,
      description,
      action_taken || null,
      severity || '보통',
      resolved ? 1 : 0,
    ],
  });

  const created = await db.execute({
    sql: `SELECT fh.*, eq.name AS equipment_name, eq.type AS equipment_type
          FROM fault_history fh
          JOIN equipments eq ON eq.id = fh.equipment_id
          WHERE fh.id = ?`,
    args: [Number(result.lastInsertRowid)],
  });
  res.status(201).json({ success: true, data: created.rows[0], message: '이상 이력이 등록되었습니다' });
}

// 이상 이력 수정 (삭제 금지 — 이력 보존 원칙)
async function update(req, res) {
  const existing = await db.execute({
    sql: 'SELECT * FROM fault_history WHERE id = ?',
    args: [req.params.id],
  });
  if (existing.rows.length === 0) {
    return res.status(404).json({ success: false, data: null, message: '이상 이력을 찾을 수 없습니다' });
  }
  const row = existing.rows[0];

  const { fault_date, description, action_taken, severity, resolved } = req.body;

  if (severity && !SEVERITIES.includes(severity)) {
    return res.status(400).json({ success: false, data: null, message: '심각도는 경미/보통/심각 중 하나여야 합니다' });
  }

  await db.execute({
    sql: `UPDATE fault_history
          SET fault_date = ?, description = ?, action_taken = ?, severity = ?, resolved = ?
          WHERE id = ?`,
    args: [
      fault_date        ?? row.fault_date,
      description       ?? row.description,
      action_taken !== undefined ? (action_taken || null) : row.action_taken,
      severity          ?? row.severity,
      resolved !== undefined ? (resolved ? 1 : 0) : row.resolved,
      req.params.id,
    ],
  });

  const updated = await db.execute({
    sql: `SELECT fh.*, eq.name AS equipment_name, eq.type AS equipment_type
          FROM fault_history fh
          JOIN equipments eq ON eq.id = fh.equipment_id
          WHERE fh.id = ?`,
    args: [req.params.id],
  });
  res.json({ success: true, data: updated.rows[0], message: '이상 이력이 수정되었습니다' });
}

module.exports = { getAll, create, update };
