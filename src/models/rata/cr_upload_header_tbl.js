const {Sequelize, Model, DataTypes} = require('sequelize');

class cr_upload_header_tbl extends Model {
    static init(sequelize) {
        return super.init({
            id: {
                type: DataTypes.STRING,
                primaryKey: true
            },
            CR_CODE:{
                type: DataTypes.STRING
            },
            COMPANY_CODE:{
                type: DataTypes.STRING
            },
            REF_CODE:{
                type: DataTypes.STRING
            },
            CR_DATE:{
                type: DataTypes.STRING
            },
            DATE_CONFIRMED:{
                type: DataTypes.STRING
            },
            ITEM_TYPE:{
                type: DataTypes.STRING
            },
            SUPPLIER_CODE:{
                type: DataTypes.STRING
            },
            DEPARTMENT_CODE:{
                type: DataTypes.STRING
            },
            PARTICULAR:{
                type: DataTypes.STRING
            },
            REF_SI_NO:{
                type: DataTypes.STRING
            },
            REF_CROSS:{
                type: DataTypes.STRING
            },
            CR_AMT:{
                type: DataTypes.STRING
            },
            STATUS:{
                type: DataTypes.STRING
            },
            created_by:{
                type: DataTypes.STRING
            },
            createdAt:{
                type: DataTypes.DATE
            },
            updated_by:{
                type: DataTypes.STRING
            },
            updatedAt:{
                type: DataTypes.DATE
            }
        },
        {
          sequelize,
          tableName:'cr_upload_header_tbl',
          freezeTableName: true  
        })
    }

    static associate (models) {
        this.user = this.hasOne(models.user_tbl,{
            foreignKey:'id',
            sourceKey:'created_by'
        })
    }
}

module.exports = cr_upload_header_tbl