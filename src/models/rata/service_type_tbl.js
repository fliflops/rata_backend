const {Model, Sequelize, DataTypes} = require('sequelize');


class service_type_tbl extends Model {
    static init (sequelize) {
        return super.init({
            service_type_code:{
                primaryKey: true,
                type: DataTypes.STRING(50)
            },
            service_type_desc:{
                allowNull:false,
                type: DataTypes.STRING(255)
            },
            ascii_service_type:{
                allowNull:true,
                type: DataTypes.STRING(50)
            },
            ascii_item_code:{
                allowNull:true,
                type: DataTypes.STRING(50) 
            },
            createdAt:Sequelize.DATE,
            updatedAt:Sequelize.DATE,
            created_by:{
                type: DataTypes.STRING(50) 
            },
            updated_by:{
                type: DataTypes.STRING(50) 
            }
        },
        {
            sequelize,
            tableName:'service_type_tbl',
            freezeTableName: true
        })
    }
}

module.exports = service_type_tbl;