const router = require('express').Router();
const {authorize} = require('../middleware/auth');
const controller = require('../controllers/contractController');
const validation = require('../middleware/query-validator.middlerware');

router.route('/')
.get(authorize,controller.getContracts)

router.route('/contract-id/:contract_id')
.get(authorize,controller.getContractHeader)
.put(authorize,controller.updateContract)

router.route('/contract-tariff')
.get(authorize,validation('contract-tariff'),controller.getContractTariff)
.put(authorize,controller.updateContractTariff)

router.route('/validity/:contract_id')
.post(authorize, controller.updateContractValidity)

router.route('/contract-tariff/:contract_id')
.get(authorize, controller.getExtendRates)
.put(authorize, controller.extendRates)

module.exports = router