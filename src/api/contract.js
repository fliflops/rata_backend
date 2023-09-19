const router = require('express').Router();
const {authorize} = require('../middleware/auth');
const controller = require('../controllers/contractController');

router.route('/')
.get(authorize,controller.getContracts)

router.route('/contract-id/:contract_id')
.get(authorize,controller.getContractHeader)
.put(authorize,controller.updateContract)

router.route('/contract-tariff')
.get(authorize,controller.getContractTariff)
.put(authorize,controller.updateContractTariff)

router.route('/validity/:contract_id')
.post(authorize, controller.updateContractValidity)

module.exports = router