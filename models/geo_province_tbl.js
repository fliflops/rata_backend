const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('geo_province_tbl',{
        country_code:{
            type: DataTypes.STRING(50)
        },
        region_code:{
            type:DataTypes.STRING(50)
        },
        province_code:{
            primaryKey:true,
            type:DataTypes.STRING(50)
        },
        province_name:{
            type:DataTypes.STRING(50)
        },
        is_active:{
            type:DataTypes.BOOLEAN
        }
    },
    {
        timestamps : false,
		freezeTableName : true
    })
}