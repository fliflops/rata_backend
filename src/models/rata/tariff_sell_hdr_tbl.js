const {Sequelize,DataTypes,Model } = require('sequelize');

class tariff_sell_hdr_tbl extends Model {
    static init(sequelize) {
        return super.init({
            tariff_id:{
                primaryKey:true,
                type:DataTypes.STRING(50)
            },
            tariff_desc:{
                type:DataTypes.STRING(255)
            },  
            vehicle_type:{
                type:DataTypes.STRING(50)
            },
            tariff_status:{
                type:DataTypes.STRING(50)
            },
            class_of_store:{
                type:DataTypes.STRING(50)
            },
            service_type:{
                type:DataTypes.STRING(50)
            },
            min_billable_unit:{
                type:DataTypes.STRING(50)
            },
            min_value:{
                type:DataTypes.DECIMAL(18,9)
            },
            max_value:{
                type:DataTypes.DECIMAL(18,9)
            },
            sub_service_type:{
                type:DataTypes.STRING(50)
            },
            equipment_type:{
                type:DataTypes.STRING(50)
            },
            leg_behavior:{
                type:DataTypes.STRING(50)
            },
            division:{
                type:DataTypes.STRING(50)
            },
            location:{
                type:DataTypes.STRING(50)
            },
            from_geo_type:{
                type:DataTypes.STRING(50)
            },
            from_geo:{
                type:DataTypes.STRING(255)
            },
            to_geo_type:{
                type:DataTypes.STRING(50)
            },
            to_geo:{
                type:DataTypes.STRING(255)
            },
            approved_by:{
                type:DataTypes.STRING(50)
            },
            approved_date:{
                type:DataTypes.STRING(50)
            },
            createdAt:Sequelize.DATE,
            updatedAt:Sequelize.DATE,
            created_by:{
                type:DataTypes.STRING(50)
            },
            modified_by:{
                type:DataTypes.STRING(50)
            }
        },
        {
            sequelize,
            freezeTableName:true,
            tableName:'tariff_sell_hdr_tbl'
        })
    }

    static async getData ({options,where}) {
        return await this.findAll({
            where:{
                ...where
            },
            ...options
        })
        .then(result => JSON.parse(JSON.stringify(result)))
    }

    static async getOneData ({options,where}) {
        return await this.findOne({
            where:{
                ...where
            },
            ...options
        })
        .then(result => JSON.parse(JSON.stringify(result)))
    }

    static async bulkCreateData ({data,options}) {
        return await this.bulkCreate(data,{
            ...options,
            ignoreDuplicates: true
        })
    }

    static async updateData ({data,where,options}) {
        return await this.update({
            ...data   
        },
        {
            where:{
                ...where
            },
            ...options
        })
    }

    static associate(models) {
        this.ic = this.hasMany(models.tariff_ic_algo_tbl,{
            foreignKey:'tariff_id',
            sourceKey:'tariff_id',
            as:'ic_data'
        })
    }

}

module.exports = tariff_sell_hdr_tbl;