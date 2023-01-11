const { Model, Sequelize, DataTypes} = require('sequelize');

class wms_draft_bill_dtl_tbl extends Model {
    static init(sequelize) {
        return super.init({
            draft_bill_no:{
                type:DataTypes.STRING,
                allowNull:false,
                primaryKey: true
            },
            wms_reference_no:{
                type:DataTypes.STRING,
                allowNull:false,
                primaryKey: true
            },
            transaction_date:{
                type:DataTypes.DATEONLY
            },
            location:{
                type:DataTypes.STRING,
            },
            primary_ref_doc:{
                type:DataTypes.STRING,
            },
            vehicle_type:{
                type:DataTypes.STRING,
            },
            tariff_id:{
                type:DataTypes.STRING,
            },
            contract_id:{
                type:DataTypes.STRING,
            },
            service_type:{
                type:DataTypes.STRING,
            },
            min_billable_value:{
                type:DataTypes.DECIMAL(18,2),
            },
            max_billable_value:{
                type:DataTypes.DECIMAL(18,2),
            },
            min_billable_unit:{
                type:DataTypes.STRING,
            },  
            class_of_store:{
                type:DataTypes.STRING,
            },
            actual_qty:{
                type:DataTypes.DECIMAL(18,2),
            },
            actual_cbm:{
                type:DataTypes.STRING,
            },
            billing_qty:{
                type:DataTypes.DECIMAL(18,2),
            },
            fk_wms_reference_no:{
                type:DataTypes.STRING,
            },
            billing:{
                type:DataTypes.DECIMAL(18,2),
            },
            created_by:{type: DataTypes.STRING(50)},
            updated_by:{type: DataTypes.STRING(50)},
            createdAt:Sequelize.DATE,
            updatedAt:Sequelize.DATE    
        },
        {
            tableName:'wms_draft_bill_dtl_tbl',
            freezeTableName:true,
            sequelize
        })
    }
}

module.exports = wms_draft_bill_dtl_tbl;