const draftBill = require('./draft-bill.validation');
const {contract_tariff,getExtendRates, putExtendRates} = require('./contract.validation');
const {transmittal} = require('./data-export.validation');
const {tariff, tariff_approve} = require('./tariff.validation');
const {create_cost_alloc} = require('./cost-alloc.validation');

module.exports = {
    'draft-bill': draftBill,
    'contract-tariff': contract_tariff,
    'export-transmittal': transmittal,
    'tariff': tariff,
    'tariff-approve': tariff_approve,

    'cost-alloc-create': create_cost_alloc,
    'extend-rates': getExtendRates,
    'extend-rates-put': putExtendRates
}