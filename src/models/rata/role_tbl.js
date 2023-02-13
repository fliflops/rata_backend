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

    static async getAllRoles ({where}) {
        return await this.findAll({
            where:{
                ...where
            }
        })
        
    }

    static async getOneData ({where,options}){

        return await this.findOne({
            where:{
                ...where
            },
            ...options
        })
        .then(result => result ? JSON.parse(JSON.stringify(result)) : result)
    }

    static async createData({data,options}){
        return await this.create(data,{
            ...options
        })
    }

    static async updateData({where,data,options}){
        return await this.update(data,{
            where:{
                ...where
            },
            ...options
        })
    }

    static async paginated ({
        filters,
        options,
        order,
        page,
        totalPage}) {
            
        const {search,...newFilters} = filters

        return await this.findAndCountAll({
            where:{
                ...newFilters
            },
            ...options,
            offset: parseInt(page) * parseInt(totalPage),
            limit:parseInt(totalPage),
            order
        })
        .then(result => JSON.parse(JSON.stringify(result)))
    }

    static associate (models) {
        this.details = this.hasMany(models.role_access_tbl,{
            foreignKey:'role_id',
            sourceKey:'role_id',
            as: 'access'
        })
    }
}

module.exports = role_tbl