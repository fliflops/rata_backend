const {Sequelize,Model,DataTypes} = require('sequelize');

class wms_data_header_tbl extends Model {
    static init (sequelize) {
        return super.init({
            wms_reference_no:{
                primaryKey:true,
                type: DataTypes.STRING(255)
            },
            service_type:{
                allowNull:false,
                type: DataTypes.STRING(255)
            },
            location:{
                allowNull:false,
                type: DataTypes.STRING(255)
            },
            principal_code:{
                type: DataTypes.STRING(255)
            },
            primary_ref_doc:{
                allowNull:false,
                type: DataTypes.STRING(255)
            },
            vehicle_type:{
                type: DataTypes.STRING(255)
            },
            transaction_date:{
                allowNull:false,
                type: DataTypes.DATEONLY
            },
            job_id:{
                type: DataTypes.STRING(255)
            },
            is_processed:{
                type: DataTypes.INTEGER
            },
            reason_code:{
                type: DataTypes.STRING(255)
            },
            createdAt:Sequelize.DATE,
            created_by:{
                type: DataTypes.STRING(255)
            },
            updatedAt:Sequelize.DATE,
            updated_by:{
                type: DataTypes.STRING(255)
            }

        },
        {
            sequelize,
            freezeTableName:true,
            tableName:'wms_data_header_tbl'
        })
    }

    static async bulkCreateData({data,options}) {
        return await this.bulkCreate(data,
        {
            ...options
        })
    }

    static async getData({where,options}) {
        return await this.findAll({
            ...options,
            where:{
                ...where
            }
        })
        .then(result => JSON.parse(JSON.stringify(result)))
    }
    
    static associate (models) {
        this.details = this.hasMany(models.wms_data_details_tbl,{
            foreignKey:'wms_reference_no',
            sourceKey:'wms_reference_no',
            as:'details'
        })
    }
}

module.exports = wms_data_header_tbl