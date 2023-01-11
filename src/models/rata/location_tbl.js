const {Model, DataTypes, Sequelize} = require('sequelize')

class location_tbl extends Model {
    static init(sequelize) {
        return super.init({
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
            sequelize,
            freezeTableName: true,
            tableName: 'location_tbl'
        })
    }
}

module.exports = location_tbl;