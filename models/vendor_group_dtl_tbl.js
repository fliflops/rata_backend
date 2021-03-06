const { Sequelize } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('vendor_group_dtl_tbl',{
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
        freezeTableName : true
    })
}