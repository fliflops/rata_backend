const {Sequelize,DataTypes,Model} = require('sequelize');

class draft_bill_ascii_dtl_tbl extends Model {
    static init(sequelize) {
        return super.init({
            id:{
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4   
            },
            fk_id:{
                type: DataTypes.STRING
            },
            draft_bill_no:{
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
            }
        },
        {
            sequelize,
            freezeTableName: true,
            timestamps:false,
            tableName: 'draft_bill_ascii_dtl_tbl'
        })
    }
}

module.exports = draft_bill_ascii_dtl_tbl;