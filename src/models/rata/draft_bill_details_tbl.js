const {Sequelize,Model,DataTypes} = require('sequelize');

class draft_bill_details_tbl extends Model { 
    static init (sequelize){
        return super.init({
            draft_bill_no: {
                allowNull:false,
                primaryKey:true,
                type: DataTypes.STRING(50)
            },
            tms_reference_no: {
                primaryKey:true,
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            fk_tms_reference_no: {
                type: DataTypes.STRING(50)
            },
            delivery_date:{
                type: DataTypes.DATEONLY
            },
            location: {
                type: DataTypes.STRING(50)
            },
            trip_plan: {
                primaryKey:true,
                type: DataTypes.STRING(50)
            },
            shipment_manifest: {
                type: DataTypes.STRING(50)
            },
            dr_no: {
                type: DataTypes.STRING(50)
            },
            invoice_no: {
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            delivery_status: {
                type: DataTypes.STRING(50)
            },
            vehicle_type: {
                type: DataTypes.STRING(50)
            },
            tariff_id: {
                type: DataTypes.STRING(50)
            },
            contract_id: {
                type: DataTypes.STRING(50)
            },
            service_type: {
                type: DataTypes.STRING(50)
            },
            sub_service_type: {
                type: DataTypes.STRING(50)
            },
            min_billable_value:{
                type: DataTypes.DECIMAL
            },
            max_billable_value:{
                type: DataTypes.DECIMAL
            },
            min_billable_unit: {
                type: DataTypes.STRING(50)
            },
            from_geo_type: {
                type: DataTypes.STRING(50)
            },
            ship_from: {
                type: DataTypes.STRING(50)
            },
            to_geo_type: {
                type: DataTypes.STRING(50)
            },
            ship_to: {
                type: DataTypes.STRING(50)
            },
            remarks: {
                type: DataTypes.STRING(50)
            },
            class_of_store: {
                type: DataTypes.STRING(50)
            },
            planned_qty:{
                type: DataTypes.DECIMAL
            },
            actual_qty:{
                type: DataTypes.DECIMAL
            },
            actual_weight:{
                type: DataTypes.DECIMAL
            },
            actual_cbm:{
                type: DataTypes.DECIMAL
            },
            planned_weight:{
                type: DataTypes.DECIMAL
            },
            planned_cbm:{
                type: DataTypes.DECIMAL
            },
            return_qty:{
                type: DataTypes.DECIMAL
            },
            billing:{
                type: DataTypes.DECIMAL
            },
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE
        },
        {
            sequelize,
            freezeTableName:true,
            tableName:'draft_bill_detail_tbl'
        })
    }

    static associate (models) {
        this.invoices = this.hasOne(models.helios_invoices_hdr_tbl,({
            sourceKey:'fk_tms_reference_no',
            foreignKey:'tms_reference_no',
            as:'invoice'
        }))

        this.draft_bill = this.hasOne(models.draft_bill_hdr_tbl,{
            sourceKey:'draft_bill_no',
            foreignKey:'draft_bill_no'
        })
    }
}

module.exports = draft_bill_details_tbl