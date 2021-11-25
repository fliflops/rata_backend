const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('agg_conditions_tbl',{
        agg_id:{
            primaryKey:true,
            type:DataTypes.STRING(50)
        },
        line_no:{
            primaryKey:true,
            type:DataTypes.INTEGER
        },
        raw_formula:{
            primaryKey:true,
            type:DataTypes.STRING(255)
        },
        raw_condition:{
            primaryKey:true,
            type:DataTypes.STRING(255)
        }
    },
    {
        freezeTableName : true,
        timestamps : false
    })
}