const router = require('express').Router();
const controller = require('../controllers/administrationController');
const {authorize} = require('../middleware/auth');

router.route('/role')
.get(authorize,controller.getRoles)
.post(authorize,controller.postRole)

router.route('/role/:id')
.get(authorize,controller.getRoleDetails)
.post(authorize,controller.postRoleAccess)
.put(authorize, controller.activateRole)

router.route('/user')

module.exports = router;