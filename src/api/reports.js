const router = require('express').Router();
const controllers = require('../controllers/reportsController')

router.post('/pre-billing/crossdock-secondary',controllers.createPreBillingReport);
router.post('/pre-billing/p2p', controllers.createP2PReport)
router.post('/pre-billing/reverse-logistics', controllers.reverseLogistics)

router.get('/',controllers.getPaginatedReports)

router.route('/:report_name')
.put(controllers.updateReport)
.get(controllers.getPaginatedReportDetails)
.post(controllers.downloadReport)

router.route('/pod/report/sell')
    .get(controllers.createPodReport)
router.route('/pod/report/buy')
    .get(controllers.createPodReportBuy)
module.exports = router;