const router = require('express').Router();
const controllers = require('../controllers/dataManagementController');
const {authorize} = require('../middleware/auth');


router.route('/vendors')
.get(authorize,controllers.getVendor)
.put(authorize,controllers.updateVendor)

router.route('/algorithm')
.get(authorize,controllers.getAlgorithm)
.post(authorize, controllers.createAlgorithm)

router.route('/algorithm/details/:id')
.get(authorize, controllers.getAlgorithmDetails)
.post(authorize,controllers.createAlgorithmDetails)
.put(authorize, controllers.updateAlgorithm)

router.get('/geography',authorize,controllers.getGeo)
router.get('/ship-point',authorize,controllers.getShipPoint)
router.get('/location', authorize,controllers.getLocation)
router.get('/quick-code', authorize,controllers.getQuickCode)
router.get('/principal', authorize,controllers.getPrincipal)

module.exports = router;