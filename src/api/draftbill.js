const router = require('express').Router();
const controller = require('../controllers/draftbillController');
const costAllocController = require('../controllers/costAllocController');
const {authorize} = require('../middleware/auth');
const validator = require('../middleware/query-validator.middlerware');

router.route('/')
.get(authorize,validator('draft-bill'),controller.getDraftBill)

router.route('/cost-allocation')
.get(authorize,costAllocController.getPaginatedDetails)

router.route('/sell')
.post(controller.createDraftBillSell)

router.route('/buy')
.post(controller.createDraftBillBuy)

router.route('/wms')
.get(authorize,controller.getWMSDraftBill)

module.exports = router;