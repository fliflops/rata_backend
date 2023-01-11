const router = require('express').Router();
const controllers = require('../controllers/dataUploadController');
const {authorize} = require('../middleware/auth');

router.route('/vendor')
router.route('/tariff')
.post(authorize,controllers.uploadTariff)

router.route('/wms-tariff')
.post(authorize,controllers.uploadWMSTariff)

router.route('/wms-contract')
.post(authorize,controllers.uploadWMSContractTariff)


router.route('/template')
.post(authorize,controllers.getTemplate)

module.exports = router;
