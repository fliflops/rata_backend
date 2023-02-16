const router = require('express').Router();
const controllers = require('../controllers/dataUploadController');
const {authorize} = require('../middleware/auth');

router.route('/ship-point')
.post(authorize,controllers.uploadShipPoint)

router.route('/principal')
.post(authorize,controllers.uploadPrincipal)

router.route('/vendor')
.post(authorize,controllers.uploadVendor)

router.route('/tariff')
.post(authorize,controllers.uploadTariff)

router.route('/contract')
.post(authorize,controllers.uploadContract)

router.route('/wms-tariff')
.post(authorize,controllers.uploadWMSTariff)

router.route('/wms-contract')
.post(authorize,controllers.uploadWMSContractTariff)

router.route('/template')
.post(authorize,controllers.getTemplate)

module.exports = router;
