const router        = require('express').Router();
const {authorize}   = require('../middleware/auth');
const controllers = require('../controllers/crUploadController');
const multer = require('../middleware/multer');

router.route('/template')
.post(controllers.downloadTemplate)

router.route('/')
.post(authorize,multer.upload.single('file'),controllers.uploadCR)
.get(authorize,controllers.getPaginatedCr);

router.route('/header/:id')
.get(authorize, controllers.getCr)

router.route('/details/:id')
.get(authorize, controllers.getPaginatedDetails)

router.route('/errors/:id')
.get(authorize, controllers.getPaginatedErrors)


module.exports = router;

