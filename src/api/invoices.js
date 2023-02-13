const router = require('express').Router();
const controllers = require('../controllers/invoiceController');
const {authorize} = require('../middleware/auth');

router.route('/')
.get(authorize,controllers.getInvoices)

module.exports = router;