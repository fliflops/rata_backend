const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);
const {dbConfig} = require('../config');
const Sequelize = require('sequelize');

const sequelize = new Sequelize({
    ...dbConfig
});

let db = {};

fs.readdirSync(__dirname)
	.filter(file => {
		return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
	})
	.forEach(file => {
		let model = require(path.join(__dirname,file))(sequelize, Sequelize.DataTypes);
		db[model.name] = model;
	});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

//Associations

//Baranagay Table Association
db.geo_barangay_tbl.hasOne(db.geo_country_tbl,{
	foreignKey:"country_code",
	sourceKey:"country_code",
	as:"country"
})

db.geo_country_tbl.belongsTo(db.geo_barangay_tbl,{
	foreignKey:"country_code"
})

db.geo_barangay_tbl.hasOne(db.geo_region_tbl,{
	foreignKey:"region_code",
	sourceKey:"region_code",
	as:"region"
})


//Contract Table Associations
db.contract_hdr_tbl.hasOne(db.principal_tbl,{
	foreignKey:"principal_code",
	sourceKey:"principal_code",
	as:"principal"
})

db.principal_tbl.belongsTo(db.contract_hdr_tbl,{
	foreignKey:"principal_code"
})

//WMS Contract Tariff
db.contract_tariff_wms_tbl.hasOne(db.agg_tbl,{
	foreignKey:'id',
	sourceKey:'fk_agg_id',
	as:'agg_rule'
})

db.contract_tariff_wms_tbl.hasOne(db.tariff_wms_tbl,{
	foreignKey:'tariff_id',
	sourceKey:'tariff_id',
	as:'tariff'
})

db.contract_tariff_wms_tbl.hasOne(db.contract_wms_tbl,{
	foreignKey:'contract_id',
	sourceKey:'contract_id',
	as:'contract'
})



//Contract Table Associations
db.contract_tariff_dtl.hasOne(db.agg_tbl,{
	foreignKey:'id',
	sourceKey:'fk_agg_id',
	as:'agg_rule'
})

db.contract_tariff_dtl.hasOne(db.tariff_sell_hdr_tbl,{
	foreignKey:'tariff_id',
	sourceKey:'tariff_id',
	as:'tariff'
})

db.tariff_sell_hdr_tbl.belongsTo(db.contract_tariff_dtl,{
	foreignKey:'tariff_id',
})

db.contract_tariff_dtl.hasOne(db.contract_hdr_tbl,{
	foreignKey:'contract_id',
	sourceKey:'contract_id',
	as:'contract'
})

db.contract_hdr_tbl.belongsTo(db.contract_tariff_dtl,{
	foreignKey:'contract_id'
})

//Contract WMS Association
db.contract_wms_tbl.hasOne(db.principal_tbl,{
	foreignKey:"principal_code",
	sourceKey:"principal_code",
	as:"principal"
})

//Tariff Associations
db.tariff_sell_hdr_tbl.hasOne(db.contract_tariff_dtl,{
	foreignKey:'tariff_id',
	sourceKey:'tariff_id',
	as:'contract'
})

db.contract_tariff_dtl.belongsTo(db.tariff_sell_hdr_tbl,{
	foreignKey:'tariff_id'
})

//Helios Invoice Associations
db.helios_invoices_hdr_tbl.hasMany(db.helios_invoices_dtl_tbl,{
	foreignKey:'br_no',
	sourceKey:'tms_reference_no',
	as:'details'
})




/* 
Update: Old invoice table
Invoice Associations */
db.invoices_cleared_hdr.hasMany(db.invoices_dtl_tbl,{
	foreignKey:'br_no',
	sourceKey:'br_no',
	as:'details'
})

db.invoices_dtl_tbl.belongsTo(db.invoices_cleared_hdr,{
	foreignKey:'br_no'
})


db.invoices_cleared_hdr.hasOne(db.contract_hdr_tbl,{
	foreignKey:'principal_code',
	sourceKey:'principal_code',
	as:'contract'
})

db.contract_hdr_tbl.belongsTo(db.invoices_cleared_hdr,{
	foreignKey:'principal_code'
})

db.invoices_cleared_hdr.hasOne(db.ship_point_tbl,{
	foreignKey:'stc_code',
	sourceKey:'stc_from',
	as:'ship_point_from'
})

db.invoices_cleared_hdr.hasOne(db.ship_point_tbl,{
	foreignKey:'stc_code',
	sourceKey:'stc_to',
	as:'ship_point_to'
})

db.ship_point_tbl.belongsTo(db.invoices_cleared_hdr,{
	foreignKey:'stc_code'
})

db.invoices_cleared_hdr.hasOne(db.vendor_group_dtl_tbl,{
	foreignKey:'vg_vendor_id',
	sourceKey:'trucker_id',
	as:'vendor_group'
})

db.invoices_cleared_hdr.hasOne(db.principal_tbl,{
	foreignKey:'principal_code',
	sourceKey:'principal_code',
	as:'principal_tbl'
})



//Invoice details assoc
db.invoices_dtl_tbl.hasOne(db.invoices_cleared_hdr,{
	foreignKey:'id',
	sourceKey:'fk_invoice_id',
	as:'invoices_cleared'
})

db.invoices_dtl_tbl.hasOne(db.invoices_rev_leak_tbl,{
	foreignKey:'fk_invoice_id',
	sourceKey:'fk_invoice_id',
	as:'invoices_rev_leak'
})

// db.vendor_group_dtl_tbl.belongsTo(db.invoices_cleared_hdr,{
// 	foreignKey:'vg_vendor_id'
// })

// db.invoices_cleared_hdr.hasOne(db.vendor_group_tbl,{
// 	foreignKey:'location',
// 	sourceKey:'location',
// 	foreignKey:'vendor'
// })


//Agg Associations
db.agg_tbl.hasMany(db.agg_conditions_tbl,{
	foreignKey:'agg_id',
	sourceKey:'id',
	as:'conditions'
})

db.agg_conditions_tbl.belongsTo(db.agg_tbl,{
	foreignKey:'agg_id'
})

//Invoice Revenue Leak Associations
db.invoices_rev_leak_tbl.hasOne(db.invoices_cleared_hdr,{
	foreignKey:'id',
	sourceKey:'fk_invoice_id',
	as:'invoice'
})

// db.invoices_cleared_hdr.belongsTo(db.invoices_rev_leak_tbl,{
// 	foreignKey:'id'
// })

//Vendor Associations
db.vendor_group_tbl.hasOne(db.vendor_group_dtl_tbl,{
	foreignKey:'vg_code',
	sourceKey:'vg_code',
	as:'vendors'
})

db.vendor_group_dtl_tbl.belongsTo(db.vendor_group_tbl,{
	foreignKey:'vg_code',
})

db.vendor_group_dtl_tbl.hasOne(db.vendor_group_tbl,{
	foreignKey:'vg_code',
	sourceKey:'vg_code',
	as:'vendor_header'
})

db.vendor_group_tbl.belongsTo(db.vendor_group_dtl_tbl,{
	foreignKey:'vg_code',
})

db.vendor_tbl.hasMany(db.vendor_group_dtl_tbl,{
	foreignKey:'vg_vendor_id',
	sourceKey:'vendor_id',
	as:'vendor_groups'
})

//WMS Draft Bill Association
db.wms_draft_bill_hdr_tbl.hasOne(db.location_tbl,{
	foreignKey:'loc_code',
	sourceKey:'location',
	as:'location_tbl'
})

db.wms_draft_bill_hdr_tbl.hasOne(db.principal_tbl,{
	foreignKey:'principal_code',
	sourceKey:'principal',
	as:'principal_tbl'
})


db.wms_draft_bill_hdr_tbl.hasMany(db.wms_draft_bill_dtl_tbl,{
	foreignKey:'draft_bill_no',
	sourceKey:'draft_bill_no',
	as:'draft_bill_details'
})

//Draft Bill Association 
db.draft_bill_hdr_tbl.hasOne(db.location_tbl,{
	foreignKey:'loc_code',
	sourceKey:'location',
	as:'location_tbl'
})

db.location_tbl.belongsTo(db.draft_bill_hdr_tbl,{
	foreignKey:'loc_code'
})

db.draft_bill_hdr_tbl.hasOne(db.vendor_tbl,{
	foreignKey:'vendor_id',
	sourceKey:'vendor',
	as:'vendor_tbl'
})

db.vendor_tbl.belongsTo(db.draft_bill_hdr_tbl,{
	foreignKey:'vendor_id'
})

db.draft_bill_hdr_tbl.hasOne(db.principal_tbl,{
	foreignKey:'principal_code',
	sourceKey:'customer',
	as:'principal_tbl'
})

db.principal_tbl.belongsTo(db.draft_bill_hdr_tbl,{
	foreignKey:'principal_code'
})

db.draft_bill_invoice_tbl.hasOne(db.draft_bill_hdr_tbl,{
	foreignKey:'draft_bill_no',
	sourceKey:'draft_bill_no',
	as:'header'
})

db.draft_bill_hdr_tbl.belongsTo(db.draft_bill_invoice_tbl,{
	foreignKey:'draft_bill_no'
})

//User Associations
db.user_tbl.hasOne(db.role_tbl,{
	foreignKey:'role_id',
	sourceKey:'user_role_id',
	as:'role'
})

db.role_tbl.belongsTo(db.user_tbl,{
	foreignKey:'role_id'
})


//WMS Data Association
db.wms_data_header_tbl.hasMany(db.wms_data_details_tbl,{
	foreignKey:'wms_reference_no',
	sourceKey:'wms_reference_no',
	as:'details'
})

//wms revenue leak associations
db.wms_rev_leak_tbl.hasMany(db.wms_rev_leak_dtl_tbl,{
	foreignKey:'wms_reference_no',
	sourceKey:'wms_reference_no',
	as:'details'
})

module.exports = db;


