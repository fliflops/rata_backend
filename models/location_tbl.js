// const { DataTypes } = require("sequelize/types");
// const { sequelize } = require(".");
const Sequelize = require('sequelize');

module.exports = (sequelize,DataTypes) => {
    return sequelize.define('location_tbl',{
        loc_code:{
            primaryKey:true,
            type: DataTypes.STRING(50)
        },
        loc_name:{
            type: DataTypes.STRING(255)
        },
        loc_description:{
            type: DataTypes.STRING(255)
        },
        ascii_loc_code:{
            type: DataTypes.STRING(255)
        },
        loc_status:{
            type: DataTypes.STRING(255)
        },
        createdAt:Sequelize.DATE,
        updatedAt:Sequelize.DATE,
        created_by:{
            type: DataTypes.STRING(255)
        },
        updated_by:{
            type: DataTypes.STRING(255)
        }
    },
    {
        freezeTableName : true
    })
}