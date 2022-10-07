const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('contract_wms_tbl',{
        contract_id:{
            primaryKey:true,
            type:DataTypes.STRING(50)
        },
        contract_description:{
            type:DataTypes.STRING(255)
        },
        contract_status:{
            type:DataTypes.STRING(50)
        },
        principal_code:{
            type:DataTypes.STRING(50)
        },
        valid_from:{
            type:DataTypes.STRING(50)
        },
        valid_to:{
            type:DataTypes.STRING(50)
        },
        created_by:{
            type:DataTypes.STRING(50)
        },
        updated_by:{
            type:DataTypes.STRING(50)
        },
        approvedAt:{
            type:DataTypes.STRING(50)
        },
        approved_by:{
            type:DataTypes.STRING(50)
        },
        createdAt:Sequelize.DATE,
        updatedAt:Sequelize.DATE,
        
    },
    {
        freezeTableName : true
    })
}