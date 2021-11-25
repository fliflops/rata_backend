const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('tariff_type_tbl',{
        tariff_type:{
            primaryKey:true,
            type:DataTypes.STRING(50)
        },
        tariff_desc:{
            type:DataTypes.STRING(255)    
        },
        algo_type:{
            type:DataTypes.STRING(50)        
        },
        formula:{
            type:DataTypes.STRING(255)
        },
        created_by:{
            type:DataTypes.STRING(50)
        },
        modified_by:{
            type:DataTypes.STRING(50)
        },
        createdAt:Sequelize.DATE,
        updatedAt:Sequelize.DATE
    },
    {
        freezeTableName : true
    })
}