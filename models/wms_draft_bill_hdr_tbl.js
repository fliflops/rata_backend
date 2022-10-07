const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('wms_draft_bill_hdr_tbl',{
        draft_bill_no:{
            allowNull:false,
            primaryKey: true,
            type: DataTypes.STRING(50)
        },
        principal:{
            allowNull:false,
            type: DataTypes.STRING(50)
        },
        draft_bill_date:{
            allowNull:false,
            type: DataTypes.STRING(50)
        },
        contract_id:{
            allowNull:false,
            type: DataTypes.STRING(50)
        },
        tariff_id:{
            allowNull:false,
            type: DataTypes.STRING(50)
        },
        location:{
            allowNull:false,
            type: DataTypes.STRING(50)
        },
        rate:{
            allowNull:false,
            type: DataTypes.DECIMAL(18,9)
        },
        vehicle_type:{
            allowNull:true,
            type: DataTypes.STRING(50)
        },
        min_billable_value:{
            allowNull:false,
            type: DataTypes.DECIMAL(18,9)
        },
        max_billable_value:{
            type: DataTypes.DECIMAL(18,9)
        },
        min_billable_unit:{
            type: DataTypes.STRING(50)
        },
        total_charges:{
            allowNull:false,
            type: DataTypes.DECIMAL(18,2)
        },
        total_cbm:{
            allowNull:false,
            type: DataTypes.DECIMAL(18,2)
        },
        
        total_qty:{
            type: DataTypes.DECIMAL(18,2)
        },
        
        total_billing_qty:{      
            type: DataTypes.DECIMAL(18,2)
        },
        status:{
            allowNull:false,
            type: DataTypes.STRING(50)
        },
        condition:{
            type: DataTypes.STRING(255)
        },
        formula:{
            type: DataTypes.STRING(255)
        },
        service_type:{
            allowNull:false,
            type: DataTypes.STRING(50)
        },
        job_id:{
            type: DataTypes.STRING(50)
        },
        created_by:{type: DataTypes.STRING(50)},
        updated_by:{type: DataTypes.STRING(50)},
        createdAt:Sequelize.DATE,
        updatedAt:Sequelize.DATE,
    },
    {
        freezeTableName : true
    })
}