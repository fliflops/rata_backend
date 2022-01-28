const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('role_modules_tbl',{
        id:{
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        }, 
        role_id:{
            allowNull:false,
            type: DataTypes.STRING(255)
        },
        module_name:{
            allowNull:false,
            type: DataTypes.STRING(255)
        },
        module_label:{
            allowNull:false,
            type: DataTypes.STRING(255)
        },
        route:{
            allowNull:false,
            type: DataTypes.STRING(255)
        },
        sub_module_name:{
            allowNull:false,
            type: DataTypes.STRING(255)
        },
        sub_module_label:{
            allowNull:false,
            type: DataTypes.STRING(255)
        },
        sub_module_route:{
            allowNull:false,
            type: DataTypes.STRING(255)
        },
        has_access:{
            allowNull:false,
            type: DataTypes.STRING(255)
        },
        createdAt:Sequelize.DATE,
        updatedAt:Sequelize.DATE,
        created_by:{
            type: DataTypes.STRING(255)
        },
        modified_by:{
            type: DataTypes.STRING(255)
        }
    },
    {
        freezeTableName : true   
    })
}