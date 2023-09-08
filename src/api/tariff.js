const router = require('express').Router();
const {validate} = require('express-validation');
const tariffController = require('../controllers/tariffController');
const {authorize} = require('../middleware/auth');
const {post_tariff_ic,put_tariff_ic} = require('../validations/tariff.validation');

router.route('/tariff-id/:tariff_id')
.get(authorize, tariffController.getTariff)
.put(authorize, tariffController.updateTariff)

router.route('/status')
.put(authorize, tariffController.bulkUpdateStatus)

router.route('/tariff-ic')
.get( authorize,tariffController.getTariffIC)



module.exports = router