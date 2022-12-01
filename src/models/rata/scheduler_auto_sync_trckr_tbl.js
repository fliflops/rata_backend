const {Model,Sequelize,DataTypes} = require('sequelize');

class scheduler_auto_sync_trckr_tbl extends Model {
    static init(sequelize) {
        return super.init({
            job_id:{
                primaryKey: true,
                type: DataTypes.STRING
            },
            scheduler_id:{
                allowNull:false,
                type: DataTypes.STRING
            },
            transaction_date:{
                allowNull:false,
                type: DataTypes.DATEONLY
            },
            job_status:{
                allowNull:false,
                type: DataTypes.STRING
            },
            error_info:{
                type: DataTypes.STRING
            },
            payload:{
                type: DataTypes.STRING
            },
            createdAt:Sequelize.DATE,
            updatedAt:Sequelize.DATE
        },
        {
            sequelize,
            tableName:'scheduler_auto_sync_trckr_tbl',
            freezeTableName: true
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

    static async updateData({data,where,options}) {
        return await this.update({
            ...data
        },
        {
            where:{
                ...where
            },
            ...options
        })
    }

    static async createData({data}) {
        return await this.create(data)
    }
}

module.exports = scheduler_auto_sync_trckr_tbl;