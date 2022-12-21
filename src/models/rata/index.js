const Sequelize = require('sequelize');
const {dbConfig} = require('../../../config');
const user_tbl                      = require('./user_tbl')
const role_tbl                      = require('./user_tbl')
const role_modules_tbl              = require('./role_module');

const helios_invoices_hdr_tbl       = require('./helios_invoices_hdr_tbl');
const helios_invoices_dtl_tbl       = require('./helios_invoices_dtl_tbl');



const contract_hdr_tbl              = require('./contract_hdr_tbl');
const contract_tariff_dtl           = require('./contract_tariff_dtl');
const tariff_sell_hdr_tbl           = require('./tariff_sell_hdr_tbl');
const tariff_ic_algo_tbl            = require('./tariff_ic_algo_tbl');
const agg_tbl                       = require('./agg_tbl');
const agg_conditions_tbl            = require('./agg_conditions_tbl');


const vendor_tbl                    = require('./vendor_tbl');
const vendor_group_tbl              = require('./vendor_group_tbl');
const vendor_group_dtl_tbl          = require('./vendor_group_dtl_tbl');

const ship_point_tbl                = require('./ship_point_tbl');

const draft_bill_hdr_tbl            = require("./draft_bill_hdr_tbl");
const draft_bill_details_tbl        = require('./draft_bill_details_tbl');
// v1 draft bill details
const draft_bill_invoice_tbl        = require('./draft_bill_invoice_tbl');

const transport_rev_leak_hdr_tbl    = require('./transport_rev_leak_hdr_tbl'); 
const tranport_rev_leak_dtl_tbl     = require('./tranport_rev_leak_dtl_tbl');

const scheduler_setup_tbl           = require('./scheduler_setup_tbl');
const scheduler_auto_sync_trckr_tbl = require('./scheduler_auto_sync_trckr_tbl');

const wms_data_details_tbl = require('./wms_data_details_tbl');
const wms_data_header_tbl = require('./wms_data_header_tbl')

const sequelize = new Sequelize({
    ...dbConfig
})

const models = {
    user_tbl:                       user_tbl.init(sequelize),
    role_tbl:                       role_tbl.init(sequelize),
    role_modules_tbl:               role_modules_tbl.init(sequelize),
    ship_point_tbl:                 ship_point_tbl.init(sequelize),

    helios_invoices_hdr_tbl:        helios_invoices_hdr_tbl.init(sequelize),
    helios_invoices_dtl_tbl:        helios_invoices_dtl_tbl.init(sequelize),
    
    contract_hdr_tbl:               contract_hdr_tbl.init(sequelize),
    contract_tariff_dtl:            contract_tariff_dtl.init(sequelize),
    
    tariff_sell_hdr_tbl:            tariff_sell_hdr_tbl.init(sequelize), 
    tariff_ic_algo_tbl:             tariff_ic_algo_tbl.init(sequelize),
    
    agg_tbl:                        agg_tbl.init(sequelize),
    agg_conditions_tbl:             agg_conditions_tbl.init(sequelize),

    vendor_tbl:                     vendor_tbl.init(sequelize),
    vendor_group_tbl:               vendor_group_tbl.init(sequelize),
    vendor_group_dtl_tbl:           vendor_group_dtl_tbl.init(sequelize),

    draft_bill_hdr_tbl:             draft_bill_hdr_tbl.init(sequelize),
    draft_bill_invoice_tbl:         draft_bill_invoice_tbl.init(sequelize),
    draft_bill_details_tbl:         draft_bill_details_tbl.init(sequelize),
    
    transport_rev_leak_hdr_tbl:     transport_rev_leak_hdr_tbl.init(sequelize),
    tranport_rev_leak_dtl_tbl:      tranport_rev_leak_dtl_tbl.init(sequelize),

    scheduler_setup_tbl:            scheduler_setup_tbl.init(sequelize),
    scheduler_auto_sync_trckr_tbl:  scheduler_auto_sync_trckr_tbl.init(sequelize),

    wms_data_header_tbl:            wms_data_header_tbl.init(sequelize),
    wms_data_details_tbl:           wms_data_details_tbl.init(sequelize)
}

//associations
Object.values(models)
.filter(model => typeof model.associate === 'function')
.forEach(model => model.associate(models));

module.exports = {
    Sequelize,
    sequelize,
    ...models
}