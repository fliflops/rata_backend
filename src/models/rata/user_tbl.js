const { Sequelize, DataTypes, Model } = require("sequelize");

class user_tbl extends Model {
    static init(sequelize) {
        return super.init({
            id:{
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4            
            },
            email:{
                allowNull:false,
                type: DataTypes.STRING
            },
            first_name:{
                // allowNull:false,
                type: DataTypes.STRING
            },
            last_name:{
                // allowNull:false,
                type: DataTypes.STRING
            },
            status:{
                allowNull:false,
                type: DataTypes.STRING
            },
            remarks:{
                type: DataTypes.STRING
            },
            user_role_id:{
                type: DataTypes.STRING
            },
            password:{
                allowNull:false,
                type: DataTypes.STRING
            },
            created_by:{
                type: DataTypes.STRING
            },
            updated_by:{
                type: DataTypes.STRING
            },
            deleted_by:{
                type: DataTypes.STRING
            },
            createdAt:Sequelize.DATE,
            updatedAt:Sequelize.DATE,
            deletedAt:Sequelize.DATE
        },
        {
            freezeTableName:true,
            tableName:'user_tbl',
            sequelize

        })
    }

    static async getAllUsers (where) {
        return this.findAll({
            where:{
                ...where
            }
        })
    }
}

module.exports = user_tbl