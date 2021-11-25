const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const geo_country_tbl = sequelize.define('geo_country_tbl',{
        country_code:{
            primaryKey:true,
            type: DataTypes.STRING(50)
        },
        country_name:{
            allowNull:false,
            type: DataTypes.STRING(50)
        },
        is_active:{
            type:DataTypes.BOOLEAN
        }
    },
    {
        timestamps : false,
		freezeTableName : true
    })

    return geo_country_tbl
}