const {Sequelize,DataTypes,Model} = require('sequelize');

class cr_upload_details_tbl extends Model {
    static init(sequelize) {
        return super.init({
            id:{
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4   
            },
            fk_header_id:{
                type: DataTypes.STRING
            },
            COMPANY_CODE:{
                type: DataTypes.STRING
            },
            CR_CODE:{
                type: DataTypes.STRING
            },
            LINE_NO:{
                type: DataTypes.STRING
            },
            ITEM_CODE:{
                type: DataTypes.STRING
            },
            SERVICE_TYPE_CODE:{
                type: DataTypes.STRING
            },
            PRINCIPAL_CODE:{
                type: DataTypes.STRING
            },
            LOCATION_CODE:{
                type: DataTypes.STRING
            },
            UM_CODE:{
                type: DataTypes.STRING
            },
            QUANTITY:{
                type: DataTypes.STRING
            },
            UNIT_PRICE:{
                type: DataTypes.STRING
            },
            EXTENDED_AMT:{
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
            tableName:"cr_upload_details_tbl",
            freezeTableName: true
        })
    }
}

module.exports = cr_upload_details_tbl;