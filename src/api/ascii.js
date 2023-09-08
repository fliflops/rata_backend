const router = require('express').Router();
const controllers = require('../controllers/asciiControllers');
const {authorize} = require('../middleware/auth');

router.route('/transport').post(authorize,controllers.transportController).get(controllers.getSo)
router.route('/warehouse').post(authorize,controllers.warehouseController)


module.exports = router