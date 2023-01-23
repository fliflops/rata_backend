const router = require('express').Router();

router.use('/auth',             require('./auth'))
router.use('/draft-bill',       require('./draftbill'))
router.use('/tariff',           require('./tariff'))
router.use('/contract',         require('./contract'))
router.use('/scheduler',        require('./scheduler'))
router.use('/revenue-leak',     require('./revenue-leak'))
router.use('/data-management',  require('./data-management'))
router.use('/data-upload',      require('./data-upload'))
router.use('/ascii',            require('./ascii'))


module.exports = router;