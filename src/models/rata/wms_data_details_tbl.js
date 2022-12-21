const {Sequelize,DataTypes,Model} = require('sequelize');

class wms_data_details_tbl extends Model {
    static init (sequelize) {
        return super.init({ 
            id:{
                primaryKey:true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            wms_reference_no:{
                allowNull:false,
                type: DataTypes.STRING(255)
            },
            sku_code:{
                allowNull:false,
                type: DataTypes.STRING(255)
            },
            actual_qty:{
                allowNull:false,
                type: DataTypes.DECIMAL
            },
            uom:{
                allowNull:false,
                type: DataTypes.STRING
            },
            actual_cbm:{
                allowNull:false,
                type: DataTypes.DECIMAL
            },
            actual_weight:{
                type: DataTypes.DECIMAL
            },
            class_of_store:{
                type: DataTypes.STRING(255)
            },
            createdAt:Sequelize.DATE,
            created_by:{
                type: DataTypes.STRING
            },
            updatedAt:Sequelize.DATE,
            updated_by:{
                type: DataTypes.STRING(255)
            }
        },
        {
            sequelize,
            freezeTableName:true,
            tableName:'wms_data_details_tbl',
            indexes:[
                {
                    unique:true,
                    fields:['wms_reference_no','sku_code','uom']
                }
            ]
        })
    }

    static async bulkCreateData({data,options}) {
        return await this.bulkCreate(data,
        {
            ...options
        })
    }
}

module.exports = wms_data_details_tbl