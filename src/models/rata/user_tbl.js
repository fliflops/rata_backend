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

    static async getOneData ({where,options}) {
        return this.findOne({
            where:{
                ...where
            },
            ...options
        })
        .then(result => result ? JSON.parse(JSON.stringify(result)) : null)
    }

    static async getAllData ({where}) {
        return this.findAll({
            where:{
                ...where
            }
        })
        .then(result => JSON.parse(JSON.stringify(result)))
    }

    static associate (models) {
        this.role = this.hasOne(models.role_tbl,{
            sourceKey:'user_role_id',
            foreignKey:'role_id',
            as:'role'
        })

        this.role_access = this.hasMany(models.role_access_tbl,{
            sourceKey:'user_role_id',
            foreignKey:'role_id',
            as:'access'
        })
    }


}

module.exports = user_tbl