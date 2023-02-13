const router = require('express').Router();
const {sessionAuthentication} = require('../loaders/middleware');
const {authorize} = require('../src/middleware/auth')


router.get('/', (req,res) => {
    res.status(200).json('RATA System Index')
})

router.use('/auth',             sessionAuthentication,  require('./authentication'));
router.use('/users',            authorize,  require('./users'));
router.use('/data-management',  authorize,  require('./data-management'));
router.use('/select',           authorize,  require('./select'));
router.use('/helios',           authorize,  require('./helios'));
router.use('/contract-tariff',  authorize,  require('./contract-tariff'));
router.use('/draft-bill',       authorize,  require('./draft-bill'));
router.use('/data-upload',      authorize,  require('./data-upload'));
router.use('/data-download',    authorize,  require('./data-download'));
router.use('/roles',            authorize,  require('./roles'));
router.use('/scheduler',        authorize,  require('./scheduler'));
router.use('/test',             require('./test'));

module.exports = router