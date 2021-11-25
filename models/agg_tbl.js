const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('agg_tbl',{
        id:{
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        agg_name:{
            allowNull:false,
            type: DataTypes.STRING(255)
        },
        with_agg:{
            allowNull:false,
            type:DataTypes.BOOLEAN
        },
        parameter:{
            type: DataTypes.STRING(255)
        },
        group_by:{
            type: DataTypes.STRING(255)

        },
        status:{
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