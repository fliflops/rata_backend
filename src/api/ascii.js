const router = require('express').Router();
const controllers = require('../controllers/asciiControllers');

router.route('/transport').post(controllers.transportController)
router.route('/warehouse').post(controllers.warehouseController)

module.exports = router