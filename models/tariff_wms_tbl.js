const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('tariff_wms_tbl',{
        tariff_id:{
            primaryKey:true,
            type:DataTypes.STRING(50)
        },
        tariff_desc:{
            type:DataTypes.STRING(255)
        },  
        vehicle_type:{
            type:DataTypes.STRING(50)
        },
        tariff_status:{
            type:DataTypes.STRING(50)
        },
        class_of_store:{
            type:DataTypes.STRING(50)
        },
        service_type:{
            type:DataTypes.STRING(50)
        },
        min_billable_unit:{
            type:DataTypes.STRING(50)
        },
        min_value:{
            type:DataTypes.DECIMAL(18,9)
        },
        max_value:{
            type:DataTypes.DECIMAL(18,9)
        },
        location:{
            type:DataTypes.STRING(50)
        },
        approved_by:{
            type:DataTypes.STRING(50)
        },
        approved_date:{
            type:DataTypes.STRING(50)
        },
        createdAt:Sequelize.DATE,
        updatedAt:Sequelize.DATE,
        created_by:{
            type:DataTypes.STRING(50)
        },
        updated_by:{
            type:DataTypes.STRING(50)
        }
    },
    {
        freezeTableName : true
    })
}