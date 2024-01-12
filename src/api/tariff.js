const router = require('express').Router();
const {validate} = require('express-validation');
const tariffController = require('../controllers/tariffController');
const {authorize} = require('../middleware/auth');
const validator = require('../middleware/body-validator.middleware')

router.route('/tariff-id/:tariff_id')
.get(authorize, tariffController.getTariff)
.put(authorize,validator('tariff'),tariffController.updateTariff)
.post(authorize, validator('tariff-approve'), tariffController.approveTariff)

router.route('/status')
.put(authorize, tariffController.bulkUpdateStatus)

router.route('/tariff-ic')
.get(authorize,tariffController.getTariffIC)



module.exports = router