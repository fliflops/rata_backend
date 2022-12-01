const router = require('express').Router();
const {validate} = require('express-validation');
const tariffController = require('../controllers/tariffController');
const {authorize} = require('../middleware/auth');
const {post_tariff_ic,put_tariff_ic} = require('../validations/tariff.validation');

router.route('/tariff-ic')
.get(   authorize,tariffController.getTariffIC)
.post(  authorize,validate(post_tariff_ic),tariffController.postTariffIC)
.put(   authorize,validate(put_tariff_ic),tariffController.putTariffIC)

module.exports = router