const { db } = require('../models/db');

// 설비 목록 조회
async function getAll(req, res) {
  const { status, type } = req.query;

  let sql = 'SELECT * FROM equipments';
  const args = [];
  const conditions = [];

  if (status) {
    conditions.push('status = ?');
    args.push(status);
  }
  if (type) {
    conditions.push('type = ?');
    args.push(type);
  }
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  sql += ' ORDER BY created_at DESC';

  const result = await db.execute({ sql, args });
  res.json({ success: true, data: result.rows, message: '조회완료' });
}

// 설비 단건 조회
async function getOne(req, res) {
  const result = await db.execute({
    sql: 'SELECT * FROM equipments WHERE id = ?',
    args: [req.params.id],
  });
  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, data: null, message: '설비를 찾을 수 없습니다' });
  }
  res.json({ success: true, data: result.rows[0], message: '조회완료' });
}

// 설비 등록
async function create(req, res) {
  const { name, type, capacity, manufacturer, install_date, location, status } = req.body;

  if (!name || !type) {
    return res.status(400).json({ success: false, data: null, message: '설비명과 설비종류는 필수입니다' });
  }

  const result = await db.execute({
    sql: `INSERT INTO equipments (name, type, capacity, manufacturer, install_date, location, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [name, type, capacity || null, manufacturer || null, install_date || null, location || null, status || '정상'],
  });

  const created = await db.execute({
    sql: 'SELECT * FROM equipments WHERE id = ?',
    args: [Number(result.lastInsertRowid)],
  });
  res.status(201).json({ success: true, data: created.rows[0], message: '설비가 등록되었습니다' });
}

// 설비 수정
async function update(req, res) {
  const existing = await db.execute({
    sql: 'SELECT * FROM equipments WHERE id = ?',
    args: [req.params.id],
  });
  if (existing.rows.length === 0) {
    return res.status(404).json({ success: false, data: null, message: '설비를 찾을 수 없습니다' });
  }
  const eq = existing.rows[0];

  const { name, type, capacity, manufacturer, install_date, location, status } = req.body;

  await db.execute({
    sql: `UPDATE equipments
          SET name = ?, type = ?, capacity = ?, manufacturer = ?,
              install_date = ?, location = ?, status = ?
          WHERE id = ?`,
    args: [
      name ?? eq.name,
      type ?? eq.type,
      capacity ?? eq.capacity,
      manufacturer ?? eq.manufacturer,
      install_date ?? eq.install_date,
      location ?? eq.location,
      status ?? eq.status,
      req.params.id,
    ],
  });

  const updated = await db.execute({
    sql: 'SELECT * FROM equipments WHERE id = ?',
    args: [req.params.id],
  });
  res.json({ success: true, data: updated.rows[0], message: '설비 정보가 수정되었습니다' });
}

module.exports = { getAll, getOne, create, update };
