const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('draft_bill_hdr_tbl',{
        draft_bill_no:{
            allowNull:false,
            primaryKey: true,
            type: DataTypes.STRING(50)
        },
        customer:{
            allowNull:false,
            type: DataTypes.STRING(50)
        },
        contract_type:{
            allowNull:false,
            type: DataTypes.STRING(50)
        },
        draft_bill_date:{
            allowNull:false,
            type: DataTypes.STRING(50)
        },
        delivery_date:{
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
        trip_no:{
            allowNull:true,
            type: DataTypes.STRING(50)
        },
        vendor:{
            allowNull:true,
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
        stc_from:{allowNull:false,
            type: DataTypes.STRING(50)},
        stc_to:{allowNull:false,
            type: DataTypes.STRING(50)},
        min_billable_value:{
            allowNull:false,
            type: DataTypes.DECIMAL(18,9)},
        min_billable_unit:{
            type: DataTypes.STRING(50)
        },
        total_charges:{
            allowNull:false,
            type: DataTypes.DECIMAL(18,9)
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
        sub_service_type:{
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