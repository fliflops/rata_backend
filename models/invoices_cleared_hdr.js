const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('invoices_cleared_hdr',{
        id:{
            allowNull: false,
            primaryKey: true,
            type:DataTypes.STRING(50)
            // type: DataTypes.UUID,
            // defaultValue: DataTypes.UUIDV4
        },
        trip_no:{
            type:DataTypes.STRING(50)
        },
        trip_date:{
            type:DataTypes.STRING(50)
        },
        location:{
            type:DataTypes.STRING(50)
        },
        trucker_id:{
            type:DataTypes.STRING(50)
        },
        trucker_name:{
            type:DataTypes.STRING(50)
        },
        vehicle_type:{
            type:DataTypes.STRING(50)
        },
        vehicle_id:{
            type:DataTypes.STRING(50)
        },
        planned_trucker :{
            type:DataTypes.STRING(50)
        },
        planned_vehicle_type :{
            type:DataTypes.STRING(50)
        },
        planned_vehicle_id :{
            type:DataTypes.STRING(50)
        },
        br_no:{
            type:DataTypes.STRING(50),
        },
        service_type:{
            type:DataTypes.STRING(50)
        },
        sub_service_type:{
            type:DataTypes.STRING(50)
        },
        invoice_no:{
            type:DataTypes.STRING(50)
        },
        rdd:{
            type:DataTypes.STRING(50)
        },
        dr_no:{
            type:DataTypes.STRING(50)
        },
        shipment_manifest:{
            type:DataTypes.STRING(50)
        },
        principal_code:{
            type:DataTypes.STRING(50)
        },
        prinipal_name:{
            type:DataTypes.STRING(50)
        },
        stc_from:{
            type:DataTypes.STRING(50)
        },
        stc_from_name:{
            type:DataTypes.STRING(50)
        },
        stc_to:{
            type:DataTypes.STRING(50)
        },
        stc_to_name:{
            type:DataTypes.STRING(50)
        },
        delivery_status:{
            type:DataTypes.STRING(50)
        },
        rud_status:{
            type:DataTypes.STRING(50)
        },
        reason_code:{
            type:DataTypes.STRING(50)
        },
        redel_remarks:{
            type:DataTypes.STRING(50)
        },
        cleared_date:{
            type:DataTypes.STRING(50),
            allowNull:false
        },
        is_billable:{
            type:DataTypes.BOOLEAN
        },
        is_processed_sell:{type:DataTypes.BOOLEAN},
        is_processed_buy:{type:DataTypes.BOOLEAN},
        created_by:{type:DataTypes.STRING(50)},
        updated_by:{type:DataTypes.STRING(50)},
        createdAt:Sequelize.DATE,
        updatedAt:Sequelize.DATE
    },
    {
        // timestamps : false,
		freezeTableName : true
    })
}