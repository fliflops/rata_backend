const {Model,Sequelize,DataTypes} = require('sequelize');

class draft_bill_ascii_hdr_tbl extends Model {
    static init (sequelize) {
        return super.init({
            id:{
                primaryKey:true,
                type: DataTypes.STRING
            },
            draft_bill_no:{
                type: DataTypes.STRING
            },
            createdAt:  DataTypes.DATE,
            updatedAt:  DataTypes.DATE,
            created_by: DataTypes.STRING,
            updated_by: DataTypes.STRING,
        },
        {
            sequelize,
            tableName:'draft_bill_ascii_hdr_tbl',
            freezeTableName:true
        })
    }
}

module.exports = draft_bill_ascii_hdr_tbl;