const {Sequelize,DataTypes,Model} = require('sequelize');

class geo_province_tbl extends Model {
    static init(sequelize) {
        return super.init({
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
            tableName:'geo_province_tbl',
            freezeTableName:true,
            timestamps:false,
            sequelize
        })
    }

    static async getData ({where,options}) {
        return await this.findAll({
            where:{
                ...where
            },
            ...options
        })
        .then(result => JSON.parse(JSON.stringify(result)))   
    }
}

module.exports = geo_province_tbl