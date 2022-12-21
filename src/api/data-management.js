const router = require('express').Router();
const controllers = require('../controllers/dataManagementController');

router.route('/vendors')
.get(controllers.getVendor)
.put(controllers.updateVendor)





module.exports = router;