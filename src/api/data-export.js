const router = require('express').Router();
const transportRouter = require('express').Router();
const dataRouter = require('express').Router();
const controller =require('../controllers/dataExportController');

//transport export route
transportRouter.route('/invoice')
.post(controller.exportInvoice)

transportRouter.route('/draft-bill')
.post(controller.exportDraftBill)

transportRouter.route('/revenue-leak')
.post(controller.exportRevenueLeak)

transportRouter.route('/contract')
.post(controller.exportContract)

transportRouter.route('/tariff')
.post(controller.exportTariff)

//data-management export routes
dataRouter.post('/geography',   controller.exportGeography)
dataRouter.post('/vendor',      controller.exportVendor)
dataRouter.post('/principal',   controller.exportPrincipal)
dataRouter.post('/ship-point',  controller.exportShipPoint)
dataRouter.post('/location',    controller.exportLocation)
dataRouter.post('/quick-code',  controller.exportQuickCode)
dataRouter.post('/algorithm',   controller.exportAlgorithm)

router.use('/transport',transportRouter)
router.use('/data-management', dataRouter)

module.exports = router;