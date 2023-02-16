const router = require('express').Router();
const controller = require('../controllers/authController')
const {authorize} = require('../middleware/auth');

router.get('/',authorize,controller.authAccess);
router.put('/', authorize, controller.updateUser);

router.post('/login', controller.login)
router.post('/logout',controller.logout)

module.exports = router