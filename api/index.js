const router = require('express').Router();
const {sessionAuthentication} = require('../loaders/middleware');

router.use('/auth',             sessionAuthentication,  require('./authentication'));
router.use('/users',            sessionAuthentication,  require('./users'));
router.use('/data-management',  sessionAuthentication,  require('./data-management'));
router.use('/select',           sessionAuthentication,  require('./select'));
router.use('/helios',           sessionAuthentication,  require('./helios'));
router.use('/contract-tariff',  sessionAuthentication,  require('./contract-tariff'));
router.use('/draft-bill',       sessionAuthentication,  require('./draft-bill'));
router.use('/data-upload',      sessionAuthentication,  require('./data-upload'));
router.use('/data-download',    sessionAuthentication,  require('./data-download'));
router.use('/roles',            sessionAuthentication,  require('./roles'));
router.use('/scheduler',        sessionAuthentication,  require('./scheduler'));
router.use('/test',             require('./test'));

module.exports = router