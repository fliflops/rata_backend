const { Model,DataTypes } = require('sequelize');

class rata_daily_accrual_header extends Model {
    static init (sequelize) {
        return super.init({
        id :{
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        job_id:DataTypes.STRING(255),
        draft_bill_no:DataTypes.STRING(255),
        draft_bill_date:DataTypes.DATEONLY, 
        contract_type:DataTypes.STRING(255),
        service_type:DataTypes.STRING(255),
        trip_no: DataTypes.STRING(255),
        contract_id: DataTypes.STRING(255),
        tariff_id: DataTypes.STRING(255),
        customer: DataTypes.STRING(255),
        vendor: DataTypes.STRING(255),
        location: DataTypes.STRING(255),
        delivery_date: DataTypes.DATEONLY,
        trip_date: DataTypes.DATEONLY,
        rate: DataTypes.DECIMAL,
        min_rate:DataTypes.DECIMAL ,
        total_charges:DataTypes.DECIMAL ,
        vehicle_type: DataTypes.STRING(255),
        min_billable_value: DataTypes.DECIMAL,
        max_billable_value: DataTypes.DECIMAL,
        min_billable_unit: DataTypes.STRING,
        total_cbm: DataTypes.DECIMAL,
        total_qty: DataTypes.DECIMAL,
        total_weight: DataTypes.DECIMAL,
        planned_trucker: DataTypes.STRING,
        planned_vehicle_type:DataTypes.STRING,
        planned_vehicle_id:DataTypes.STRING,
        kronos_trip_status:DataTypes.STRING,
        vehicle_id:DataTypes.STRING,
        stc_from:DataTypes.STRING,
        stc_to :DataTypes.STRING,
        created_at: DataTypes.DATE,
        updated_at:  DataTypes.DATE,
        },
        {
            sequelize,
            tableName:'rata_daily_accrual_header',
            createdAt:'created_at',
            updatedAt:'updated_at'
        }) 
    }
}

module.exports = rata_daily_accrual_header;

