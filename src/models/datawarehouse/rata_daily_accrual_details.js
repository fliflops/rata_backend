const { Model,DataTypes } = require('sequelize');

class rata_daily_accrual_details extends Model {
    static init(sequelize){
        return super.init({
            id:{
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            } ,
            job_id:                 DataTypes.STRING,
            fk_header_id:           DataTypes.STRING,
            draft_bill_no:          DataTypes.STRING,
            tms_reference_no:       DataTypes.STRING,
            fk_tms_reference_no:    DataTypes.STRING,
            principal_code:         DataTypes.STRING,
            delivery_date:          DataTypes.DATEONLY,
            trip_date:              DataTypes.DATEONLY,
            location:               DataTypes.STRING,
            trip_plan:              DataTypes.STRING,
            shipment_manifest:      DataTypes.STRING,
            dr_no:                  DataTypes.STRING,
            invoice_no:             DataTypes.STRING,
            delivery_status:        DataTypes.STRING,
            vehicle_type:           DataTypes.STRING,
            tariff_id:              DataTypes.STRING,
            contract_id:            DataTypes.STRING,
            service_type:           DataTypes.STRING, 
            sub_service_type:       DataTypes.STRING,
            min_billable_value:     DataTypes.STRING,
            max_billable_value:     DataTypes.STRING,
            min_billable_unit:      DataTypes.STRING,
            from_geo_type:          DataTypes.STRING,
            ship_from:              DataTypes.STRING,
            to_geo_type:            DataTypes.STRING,
            ship_to:                DataTypes.STRING, 
            remarks:                DataTypes.STRING,
            class_of_store:         DataTypes.STRING,
            rud_status:             DataTypes.STRING,
            planned_qty:            DataTypes.STRING,
            actual_qty:             DataTypes.STRING,
            ic_qty:                 DataTypes.STRING,
            actual_weight:          DataTypes.STRING,
            actual_cbm:             DataTypes.STRING,
            planned_weight:         DataTypes.STRING,
            planned_cbm:            DataTypes.STRING,
            br_status:              DataTypes.STRING,
            planned_trucker:        DataTypes.STRING,
            planned_vehicle_type :  DataTypes.STRING,
            planned_vehicle_id:     DataTypes.STRING,
            kronos_trip_status:     DataTypes.STRING,
            uom:                    DataTypes.STRING,
            return_qty:             DataTypes.STRING,
            billing:                DataTypes.STRING,
            outlier_status:         DataTypes.STRING,
            overall_volume:         DataTypes.DECIMAL,
            created_at:             DataTypes.DATE,
            updated_at:             DataTypes.DATE 
        },
        {
            sequelize,
            tableName: 'rata_daily_accrual_details',
            freezeTableName: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        })
    }
}

module.exports = rata_daily_accrual_details