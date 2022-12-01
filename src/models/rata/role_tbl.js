const { Sequelize, DataTypes, Model } = require("sequelize");

class role_tbl extends Model {
    static init(sequelize) {
        return super.init({
            role_id:{
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            role_name:{
                allowNull:false,
                type: DataTypes.STRING
            },
            role_status:{
                allowNull:false,
                type: DataTypes.STRING
            },
            createdAt:Sequelize.DATE,
            updatedAt:Sequelize.DATE,
            created_by:{
                // allowNull:false,
                type: DataTypes.STRING
            },
            modified_by:{
                // allowNull:false,
                type: DataTypes.STRING
            }
        },
        {
            freezeTableName:true,
            tableName:'role_tbl',
            sequelize

        })
    }

    static async getAllRoles (where) {
        return this.findAll({
            where:{
                ...where
            }
        })
    }
}

module.exports = role_tbl