const router = require('express').Router();
const controller = require('../controllers/revenueLeakController');

router.route('/')
.get(controller.getRevenueLeaks)

router.route('/transport/sell')
.post(controller.transportReplanSell)

router.route('/transport/buy')
.post(controller.transportReplanBuy)


module.exports = router;