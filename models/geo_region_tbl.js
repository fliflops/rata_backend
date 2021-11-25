const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const geo_region_tbl = sequelize.define('geo_region_tbl',{
        country_code:{
            type: DataTypes.STRING(50)
        },
        region_code:{
            primaryKey:true,
            type:DataTypes.STRING(50)
        },
        region_name:{
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

    return geo_region_tbl
}