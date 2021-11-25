const Sequelize = require('sequelize');

module.exports = (sequelize,DataTypes) => {
    return sequelize.define('ship_point_tbl',{
        stc_code:{
            primaryKey:true,
            type:DataTypes.STRING(50)
        },
        stc_description:{
            type:DataTypes.STRING(255)
        },
        stc_name:{type:DataTypes.STRING(255)},
        stc_address:{type:DataTypes.STRING(255)},
        long:{type:DataTypes.DECIMAL(18,9)},
        lat:{type:DataTypes.DECIMAL(18,9)},
        country:{type:DataTypes.STRING(50)},
        region:{type:DataTypes.STRING(50)},
        province:{type:DataTypes.STRING(50)},
        city:{type:DataTypes.STRING(50)},
        barangay:{type:DataTypes.STRING(50)},
        zip_code:{
            type:Sequelize.DataTypes.INTEGER
        },
        is_active:{
            type:Sequelize.DataTypes.BOOLEAN
        },
        created_date:Sequelize.DATE,
        modified_date:Sequelize.DATE,
        modified_by:{
            type:DataTypes.STRING(50)
        },
        created_by:{
            type:DataTypes.STRING(50)
        }
    },
    {
        freezeTableName : true,
        timestamps : false
    })
}