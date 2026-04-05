const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/equipmentController');

// async 컨트롤러 에러를 Express로 전달하는 래퍼
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.get('/',    wrap(ctrl.getAll));   // GET  /api/equipments
router.get('/:id', wrap(ctrl.getOne));   // GET  /api/equipments/:id
router.post('/',   wrap(ctrl.create));   // POST /api/equipments
router.put('/:id', wrap(ctrl.update));   // PUT  /api/equipments/:id

// 500 에러 핸들러
router.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, data: null, message: '서버 오류가 발생했습니다' });
});

module.exports = router;
