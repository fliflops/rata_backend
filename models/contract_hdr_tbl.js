const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const contract_hdr_tbl = sequelize.define('contract_hdr_tbl',{
        contract_id:{
            primaryKey:true,
            type:DataTypes.STRING(50)
        },
        contract_description:{
            type:DataTypes.STRING(255)
        },
        contract_type:{
            type:DataTypes.STRING(50)
        },
        contract_status:{
            type:DataTypes.STRING(50)
        },
        principal_code:{
            type:DataTypes.STRING(50)
        },
        trucker_id:{
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
        modified_by:{
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

    return contract_hdr_tbl
}