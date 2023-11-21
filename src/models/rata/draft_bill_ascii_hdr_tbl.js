const {Model,Sequelize,DataTypes} = require('sequelize');

class draft_bill_ascii_hdr_tbl extends Model {
    static init (sequelize) {
        return super.init({
            id:{
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            draft_bill_no:{
                type: DataTypes.STRING
            },
            createdAt:{
                type: DataTypes.DATE
            },
            updatedAt:{
                type: DataTypes.DATE
            },
            created_by:{
                type: DataTypes.STRING
            },
            updated_by:{
                type: DataTypes.STRING
            }
        },
        {
            sequelize,
            freezeTableName:true,
            tableName:'draft_bill_ascii_hdr_tbl'
        })
    }

    static associate(models) {
        this.user = this.hasOne(models.user_tbl,{
            foreignKey:'id',
            sourceKey:'created_by'
        })
    }
}

module.exports = draft_bill_ascii_hdr_tbl