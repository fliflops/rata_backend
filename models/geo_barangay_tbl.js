const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const geo_barangay_tbl = sequelize.define('geo_barangay_tbl',{
        country_code:{
            type: DataTypes.STRING(50)
        },
        region_code:{
            type:DataTypes.STRING(50)
        },
        province_code:{
            type:DataTypes.STRING(50)
        },
        city_code:{
            type: DataTypes.STRING(50)
        },
        barangay_code:{
            primaryKey:true,
            type: DataTypes.STRING(50)
        },
        barangay_name:{
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

    geo_barangay_tbl.associate = (models) => {
        geo_barangay_tbl.hasOne(models.geo_country_tbl,{
            sourceKey:'country_code',
            foreignKey:'country_name'
        })
    }


    return geo_barangay_tbl
}
