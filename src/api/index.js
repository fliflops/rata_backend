const router = require('express').Router();


router.use('/auth',         require('./auth'))
router.use('/draft-bill',   require('./draftbill'))
router.use('/tariff',       require('./tariff'))
router.use('/scheduler',    require('./scheduler'))

module.exports = router;