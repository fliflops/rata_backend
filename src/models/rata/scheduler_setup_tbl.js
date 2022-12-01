const {Sequelize,Model,DataTypes} = require('sequelize');

class scheduler_setup_tbl extends Model {
    static init(sequelize) {
        return super.init({
            id:{
                primaryKey: true,
                type: DataTypes.STRING
            },
            system_type:{
                allowNull:false,
                type: DataTypes.STRING
            },
            job_description:{
                allowNull:false,
                type: DataTypes.STRING
            },
            start_time_label:{
                allowNull:false,
                type: DataTypes.STRING
            },
            start_time_cron:{
                allowNull:false,
                type: DataTypes.STRING
            },
            is_active:{
                allowNull:false,
                type: DataTypes.STRING
            },
            redis_key:{
                allowNull:false,
                type: DataTypes.STRING
            },
            redis_scheduler_key:{
                allowNull:false,
                type: DataTypes.STRING
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
            freezeTableName:true,
            tableName:'scheduler_setup_tbl'
        })
    }

    static async getID(id) {
        return await this.findByPk(id)
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
}

module.exports = scheduler_setup_tbl