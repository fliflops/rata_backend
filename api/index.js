const router = require('express').Router();

router.use('/auth',             require('./authentication'));
router.use('/users',            require('./users'));
router.use('/data-management',  require('./data-management'));
router.use('/select',           require('./select'));
router.use('/helios',           require('./helios'));
router.use('/contract-tariff',  require('./contract-tariff'));
router.use('/draft-bill',       require('./draft-bill'));
router.use('/data-upload',      require('./data-upload'));
router.use('/data-download',    require('./data-download'));
router.use('/roles',            require('./roles'));

module.exports = router