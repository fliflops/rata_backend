const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('tariff_type_cond',{
        tariff_type:{
            primaryKey:true,
            type:DataTypes.STRING(50)
        },
        line_no:{
            primaryKey:true,
            type:Sequelize.DataTypes.INTEGER
        },
        condition:{
            type:DataTypes.STRING(50)
        },
        param_a:{
            type:DataTypes.STRING(50)
        },
        relation:{
            type:DataTypes.STRING(50)
        },
        param_b:{
            type:DataTypes.STRING(50)
        },
        value:{
            type:DataTypes.STRING(50)
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
