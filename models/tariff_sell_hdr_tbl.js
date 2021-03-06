const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const tariff_sell_hdr_tbl = sequelize.define('tariff_sell_hdr_tbl',{
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
        // tariff_type:{
        //     type:DataTypes.STRING(50)
        // },
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
        sub_service_type:{
            type:DataTypes.STRING(50)
        },
        equipment_type:{
            type:DataTypes.STRING(50)
        },
        leg_behavior:{
            type:DataTypes.STRING(50)
        },
        division:{
            type:DataTypes.STRING(50)
        },
        location:{
            type:DataTypes.STRING(50)
        },
        from_geo_type:{
            type:DataTypes.STRING(50)
        },
        from_geo:{
            type:DataTypes.STRING(255)
        },
        to_geo_type:{
            type:DataTypes.STRING(50)
        },
        to_geo:{
            type:DataTypes.STRING(255)
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
        modified_by:{
            type:DataTypes.STRING(50)
        }
    },
    {
        freezeTableName : true
    })

    return tariff_sell_hdr_tbl
}