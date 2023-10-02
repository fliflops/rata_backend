const router = require('express').Router();
const controller = require('../controllers/draftbillController');
const {authorize} = require('../middleware/auth');

router.route('/')
.get(authorize,controller.getDraftBill)

router.route('/sell')
.post(controller.createDraftBillSell)

router.route('/buy')
.post(authorize,controller.createDraftBillBuy)


router.route('/wms')
.get(authorize,controller.getWMSDraftBill)


module.exports = router;