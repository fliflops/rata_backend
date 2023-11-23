const router = require('express').Router();
const controller = require('../controllers/draftbillController');
const {authorize} = require('../middleware/auth');
const validator = require('../middleware/query-validator.middlerware');

router.route('/')
.get(authorize,validator('draft-bill'),controller.getDraftBill)

router.route('/sell')
.post(authorize,controller.createDraftBillSell)

router.route('/buy')
.post(authorize,controller.createDraftBillBuy)

router.route('/wms')
.get(authorize,controller.getWMSDraftBill)

module.exports = router;