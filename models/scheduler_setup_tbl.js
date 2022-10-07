const Sequelize = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('scheduler_setup_tbl',{
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
		freezeTableName : true
    })
}