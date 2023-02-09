const {Model,Sequelize,DataTypes} = require('sequelize');

class geo_country_tbl extends Model {
    static init(sequelize) {
        return super.init({
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
            sequelize,
            freezeTableName:true,
            timestamps:false,
            tableName:'geo_country_tbl'
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

module.exports = geo_country_tbl