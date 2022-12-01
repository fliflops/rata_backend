const { Sequelize,Model,DataTypes } = require('sequelize');

class vendor_group_dtl_tbl extends Model {
    static init(sequelize){
        return super.init({
            vg_code:{
                primaryKey:true,
                type: DataTypes.STRING(50)
            },
            vg_vendor_id:{
                primaryKey:true,
                type: DataTypes.STRING(50)
            },
            vg_vendor_status:{
                type: DataTypes.STRING(50)
            },
            location:{
                type: DataTypes.STRING(50)
            },
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE,
            created_by: {
                type: DataTypes.STRING(50)
            },
            updated_by:{
                type: DataTypes.STRING(50)
            }
        },
        {
            sequelize,
            freezeTableName:true,
            tableName:'vendor_group_dtl_tbl'
        })
    }
}

module.exports = vendor_group_dtl_tbl;