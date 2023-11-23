const router = require('express').Router();
const controllers = require('../controllers/asciiControllers');
const {authorize} = require('../middleware/auth');
const validator = require('../middleware/query-validator.middlerware');
router.route('/transport')
.post(authorize,controllers.transportController)
.get(controllers.getSo)

router.route('/warehouse')
.post(authorize,controllers.warehouseController)

router.route('/draft-bill')
.get(authorize,validator('draft-bill'),controllers.getPaginatedTransportDraftBill)

router.route('/draft-bill/:draft_bill_no')
.get(authorize,controllers.getDraftBill)

router.route('/log-header/:draft_bill_no')
.get(authorize,controllers.getTransmittalLogHeader)

router.route('/log-details/:header_id')
.get(authorize,controllers.getTransmittalLogDetail)

module.exports = router