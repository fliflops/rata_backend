const {Sequelize,DataTypes,Model} = require('sequelize')

class rata_daily_accrual_leak_details extends Model {
    static init(sequelize) {
        return super.init({
                id:{
                    allowNull: false,
                    primaryKey: true,
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4
                } ,
                fk_header_id: DataTypes.STRING ,
                job_id :DataTypes.STRING,
                trip_no :DataTypes.STRING, 
                br_no :DataTypes.STRING,
                delivery_status :DataTypes.STRING,
                class_of_store :DataTypes.STRING,
                uom :DataTypes.STRING,
                actual_qty :DataTypes.DECIMAL,
                actual_weight :DataTypes.DECIMAL,
                actual_cbm :DataTypes.DECIMAL,
                return_qty :DataTypes.DECIMAL,
                created_at :DataTypes.DATE,
                updated_at :DataTypes.DATE,        
        },
        {
            sequelize,
            tableName:'rata_daily_accrual_leak_details',
            freezeTableName: true,
            createdAt:'created_at',
            updatedAt:'updated_at'
        })
    }
}

module.exports = rata_daily_accrual_leak_details