const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dailyCheckController');

const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.get('/',    wrap(ctrl.getAll));   // GET  /api/daily-checks
router.post('/',   wrap(ctrl.create));   // POST /api/daily-checks
router.put('/:id', wrap(ctrl.update));   // PUT  /api/daily-checks/:id

router.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, data: null, message: '서버 오류가 발생했습니다' });
});

module.exports = router;
