const {Sequelize,Model,DataTypes} = require('sequelize')

class report_schedule_tbl extends Model {
    static init(sequelize ){
        return super.init({
            id:{
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4   
            },
            report_name:{
                type: DataTypes.STRING
            },
            cron:{
                type: DataTypes.STRING
            },
            redis_key:{
                type: DataTypes.STRING
            },
            is_active:{
                type: DataTypes.STRING
            },
            report_type:{
                type: DataTypes.STRING
            },
            updatedAt: DataTypes.DATE,
            createdAt: DataTypes.DATE,

        },
        {
            sequelize,
            tableName:'report_schedule_tbl',
            freezeTableName:true,
        })
    }
}

module.exports = report_schedule_tbl