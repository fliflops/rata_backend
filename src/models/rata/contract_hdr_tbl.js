const {Sequelize,Model,DataTypes} = require('sequelize');

class contract_hdr_tbl extends Model {
    static init (sequelize) {
        return super.init({
            contract_id:{
                primaryKey:true,
                type:DataTypes.STRING(50)
            },
            contract_description:{
                type:DataTypes.STRING(255)
            },
            contract_type:{
                type:DataTypes.STRING(50)
            },
            contract_status:{
                type:DataTypes.STRING(50)
            },
            principal_code:{
                type:DataTypes.STRING(50)
            },
            trucker_id:{
                type:DataTypes.STRING(50)
            },
            vendor_group:{
                type:DataTypes.STRING(50)
            },
            valid_from:{
                type:DataTypes.STRING(50)
            },
            valid_to:{
                type:DataTypes.STRING(50)
            },
            created_by:{
                type:DataTypes.STRING(50)
            },
            modified_by:{
                type:DataTypes.STRING(50)
            },
            approvedAt:{
                type:DataTypes.STRING(50)
            },
            approved_by:{
                type:DataTypes.STRING(50)
            },
            createdAt:Sequelize.DATE,
            updatedAt:Sequelize.DATE,
        },
        {
            sequelize,
            freezeTableName:true,
            tableName:'contract_hdr_tbl'
        })
    }

    static async getContracts ({where,options}) {
        return await this.findAll({
            ...options,
            where:{
                ...where
            }
        })
        .then(result => JSON.parse(JSON.stringify(result)))
    }

    static associate (models) {
        this.tariffs = this.hasMany(models.contract_tariff_dtl,{
            foreignKey:'contract_id',
            sourceKey:'contract_id'
        })
    }
}

module.exports = contract_hdr_tbl