const {Sequelize,DataTypes,Model} = require('sequelize')

class rata_daily_accrual_leak_header extends Model {
    static init(sequelize) {
        return super.init({
            id:{
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            job_id: DataTypes.STRING,
            tms_reference_no: DataTypes.STRING,
            trip_no: DataTypes.STRING,
            trip_date:DataTypes.STRING,
            location :DataTypes.STRING,
            trip_status :DataTypes.STRING,
            trucker_id :DataTypes.STRING,
            vehicle_type :DataTypes.STRING,
            vehicle_id :DataTypes.STRING,
            planned_trucker :DataTypes.STRING,
            planned_vehicle_type :DataTypes.STRING,
            planned_vehicle_id :DataTypes.STRING, 
            service_type :DataTypes.STRING,
            sub_service_type :DataTypes.STRING,
            invoice_no :DataTypes.STRING,
            rdd: DataTypes.DATEONLY,
            dr_no: DataTypes.STRING,
            shipment_manifest: DataTypes.STRING,
            principal_code:DataTypes.STRING, 
            stc_from: DataTypes.STRING,
            stc_to: DataTypes.STRING,
            br_status: DataTypes.STRING,
            delivery_status: DataTypes.STRING, 
            rud_status: DataTypes.STRING,
            reason_code: DataTypes.STRING,
            is_billable:DataTypes.STRING,
            cleared_date: DataTypes.DATE,
            status: DataTypes.STRING,
            redel_remarks: DataTypes.STRING,
            kronos_trip_status: DataTypes.STRING,
            vg_code :DataTypes.STRING,
            is_ic:DataTypes.STRING,
            fk_tms_reference_no :DataTypes.STRING,
            class_of_store :DataTypes.STRING,
            draft_bill_type: DataTypes.STRING,
            revenue_leak_reason: DataTypes.STRING,
            outlier_status: DataTypes.STRING,
            overall_volume:{
                type: DataTypes.DECIMAL,
                allowNull: true
            },
            created_at:DataTypes.DATE,
            updated_at:DataTypes.DATE,
        },
        {
            sequelize,
            tableName:'rata_daily_accrual_leak_header',
            freezeTableName:true,
            createdAt:'created_at',
            updatedAt:'updated_at'
        })
    }
}

module.exports = rata_daily_accrual_leak_header
