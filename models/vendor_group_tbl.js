const { Sequelize } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('vendor_group_tbl',{
        vg_code:{
            primaryKey:true,
            type: DataTypes.STRING(50)
        },
        vg_desc:{
            type: DataTypes.STRING(255)
        },
        vg_status:{
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