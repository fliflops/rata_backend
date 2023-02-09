const {Sequelize,Model,DataTypes} = require('sequelize');

class geo_barangay_tbl extends Model {
    static init(sequelize) {
        return super.init({
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
            sequelize,
            tableName:'geo_barangay_tbl',
            freezeTableName: true,
            timestamps: false
        })
    }

    static async paginated ({
        filters,
        options,
        order,
        page,
        totalPage}) {
        const {search,...newFilters} = filters

        return await this.findAndCountAll({
            where:{
                ...newFilters
            },
            ...options,
            offset: parseInt(page) * parseInt(totalPage),
            limit:parseInt(totalPage),
            order
        })
        .then(result => JSON.parse(JSON.stringify(result)))
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

module.exports = geo_barangay_tbl