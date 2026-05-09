const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/faultHistoryController');

const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.get('/',    wrap(ctrl.getAll));   // GET  /api/fault-history
router.post('/',   wrap(ctrl.create));   // POST /api/fault-history
router.put('/:id', wrap(ctrl.update));   // PUT  /api/fault-history/:id

router.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, data: null, message: '서버 오류가 발생했습니다' });
});

module.exports = router;
