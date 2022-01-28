const Sequelize = require('sequelize');

module.exports = (sequelize,DataTypes) => {
    return sequelize.define('role_tbl',{
        role_id:{
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        role_name:{
            allowNull:false,
            type: DataTypes.STRING(255)
        },
        role_status:{
            allowNull:false,
            type: DataTypes.STRING(255)
        },
        createdAt:Sequelize.DATE,
        updatedAt:Sequelize.DATE,
        created_by:{
            // allowNull:false,
            type: DataTypes.STRING(255)
        },
        modified_by:{
            // allowNull:false,
            type: DataTypes.STRING(255)
        }
    },
    {
        freezeTableName : true
    })
}