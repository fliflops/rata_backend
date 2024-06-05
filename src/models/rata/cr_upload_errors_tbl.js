const {Sequelize,DataTypes,Model} = require('sequelize');

class cr_upload_errors_tbl extends Model {
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
            ref_code:{
                type: DataTypes.STRING
            },
            result_type:{
                type: DataTypes.STRING
            },
            field_name:{
                type: DataTypes.STRING
            },
            field_value:{
                type: DataTypes.STRING
            },
            message:{
                type: DataTypes.STRING
            },
            response_code:{
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
          freezeTableName: true,
          tableName: 'cr_upload_errors_tbl'  
        })
    }
    
    static associate (models) {
        this.user = this.hasOne(models.user_tbl,{
            foreignKey:'id',
            sourceKey:'created_by'
        })
    }

}

module.exports = cr_upload_errors_tbl;