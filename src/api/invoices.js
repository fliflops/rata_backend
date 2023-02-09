const router = require('express').Router();
const controllers = require('../controllers/invoiceController');

router.route('/')
.get(controllers.getInvoices)

module.exports = router;