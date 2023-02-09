const {Model,DataTypes,Sequelize} = require('sequelize');


class geo_region_tbl extends Model {
    static init(sequelize) {
        return super.init({
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
            sequelize,
            tableName:'geo_region_tbl',
            freezeTableName:true,
            timestamps:false
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

module.exports = geo_region_tbl