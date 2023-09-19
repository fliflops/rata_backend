const {Model,Sequelize,DataTypes} = require('sequelize');

class draft_bill_ascii_dtl_tbl extends Model {
    static init(sequelize) {
        return super.init({
            id:{
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4   
            },
            fk_id:DataTypes.STRING,
            draft_bill_no: DataTypes.STRING,
            result_type: DataTypes.ENUM(['HEADER','DETAILS']),
            field_name: DataTypes.STRING,
            filed_value:DataTypes.STRING,
            message: DataTypes.STRING,
            response_code: DataTypes.STRING
        },
        {
            sequelize,
            tableName:'draft_bill_ascii_dtl_tbl',
            freezeTableName:true
        })
    }
}

module.exports = draft_bill_ascii_dtl_tbl;