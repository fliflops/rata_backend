const {Model,Sequelize,DataTypes} = require('sequelize');

class scheduler_email_tbl extends Model {
    static init(sequelize) {
        return super.init({
            email: {
                primaryKey: true,
                type: DataTypes.STRING
            },
            scheduler_id:{
                primaryKey: true,
                type: DataTypes.STRING
            },
            status:{
                type: DataTypes.STRING
            },
            updatedAt: DataTypes.DATE,
            updated_by: DataTypes.STRING,
            createdAt:DataTypes.DATE,
            created_by:DataTypes.STRING
        },
        {
            sequelize,
            freezeTableName:true,
            tableName:'scheduler_email_tbl'
        })
    }

    static async getData({where,options}) {
        return await this.findAll({
            where:{
                ...where
            },
            ...options
        })
        .then(result => JSON.parse(JSON.stringify(result)))
    }

    static async findOneData({where,options}) {
        return await this.findOne({
            where:{
                ...where
            },
            ...options
        })
    }

    static async paginated({
        filters,
        order,
        page,
        totalPage
    }) {
        const {search,...newFilters} = filters

        return await this.findAndCountAll({
            where:{
                ...newFilters
            },
            offset: parseInt(page) * parseInt(totalPage),
            limit:parseInt(totalPage),
            order
        })
    }   

    static async updateData({
        where,
        data
    }) {
        return await this.update({
            ...data
        },
        {
            where:{
                ...where
            }
        })
    }

    static async createData({
        data
    }) {
        return await this.create({...data})
    }

}

module.exports = scheduler_email_tbl;