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
// db.geo_country_tbl.hasOne(db.geo_region_tbl,{
// 	foreignKey: "country_code",
// 	sourceKey:'country_code',
// 	as:"region"
// })



// db.geo_region_tbl.belongsTo(db.geo_country_tbl,{
// 	foreignKey:"country_code",
// })

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


//Contract Table Associations
db.contract_tariff_dtl.hasOne(db.agg_tbl,{
	foreignKey:'id',
	sourceKey:'fk_agg_id',
	as:'agg_rule'
})

db.agg_tbl.belongsTo(db.contract_tariff_dtl,{
	foreignKey:'id'
})

//Invoice Assoications
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
db.invoices_cleared_hdr.belongsTo(db.invoices_rev_leak_tbl,{
	foreignKey:'id'
})

module.exports = db;


