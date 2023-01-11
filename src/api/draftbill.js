const router = require('express').Router();
const controller = require('../controllers/draftbillController');

router.route('/')
.get(controller.getDraftBill)

router.route('/sell')
.post(controller.createDraftBillSell)

router.route('/buy')
.post(controller.createDraftBillBuy)


router.route('/wms')
.get(controller.getWMSDraftBill)


module.exports = router;