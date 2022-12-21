const router = require('express').Router();
const controller = require('../controllers/draftbillController');

router.route('/sell')
.post(controller.createDraftBillSell)

router.route('/buy')
.post(controller.createDraftBillBuy)

router.route('/')
.get(controller.getDraftBill)




module.exports = router;