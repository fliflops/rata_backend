const {Model,DataTypes } = require('sequelize');

class vehicle_types_tbl extends Model {
    static init (sequelize) {
        return super.init({
            vehicle_type:{
                primaryKey:true,
                type: DataTypes.STRING(36)
            },	
            description:{
                type: DataTypes.STRING(60)
            },		
            overall_volume:{
                type: DataTypes.STRING(36)
            },	
            volume_uom:{
                type: DataTypes.STRING(36)
            },
            status:{
                type: DataTypes.ENUM('ACTIVE','INACTIVE')
            }		
        },
        {
            sequelize,
            freezeTableName:true,
            timestamps:false,
            tableName:'vehicle_types_tbl'
        })
    }
}

module.exports = vehicle_types_tbl;