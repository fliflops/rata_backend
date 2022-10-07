const Sequelize = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('scheduler_auto_sync_trckr_tbl',{
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
		freezeTableName : true
    })
}