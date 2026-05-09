const router = require('express').Router();
const ctrl = require('../controllers/legalInspectionController');

router.get('/',     ctrl.getAll);
router.get('/:id',  ctrl.getOne);
router.post('/',    ctrl.create);
router.put('/:id',  ctrl.update);

module.exports = router;
