const router = require('express').Router();
const controller = require('../controllers/select.controller');
const { authorize } = require('../middleware/auth');


router.get('/region',authorize,controller.getRegion)
router.get('/province',authorize,controller.getProvince)
router.get('/city',authorize, controller.getCity)
router.get('/barangay', authorize, controller.getBrgy)

router.get('/ascii/service-type',authorize, controller.getAsciiDepartmentCode )
router.get('/algorithm', authorize, controller.getAlgorithm)

module.exports = router;
