const { Model,DataTypes } = require('sequelize');

class vehicle_type extends Model {
    static init (sequelize) {
        return super.init({
            id:{
                primaryKey: true,
                type: DataTypes.STRING(36)
            },
            type:{
                type: DataTypes.STRING(255)
            },
            description:{
                type: DataTypes.STRING(255)
            },
            status:{
                type: DataTypes.ENUM('ACTIVE','INACTIVE')
            },
            volume_uom:{
                type: DataTypes.STRING(255)
            },
            overall_volume:{
                type: DataTypes.DECIMAL(18,12)
            }
        },
        {
            sequelize,
            freezeTableName:true,
            timestamps:false,
            tableName:'vehicle_type'
        })
    }
}

module.exports = vehicle_type