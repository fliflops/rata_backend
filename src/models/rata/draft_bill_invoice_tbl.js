const {Model,Sequelize,DataTypes} = require('sequelize')

class draft_bill_invoice_tbl extends Model {
    static init(sequelize) {
        return super.init({
            draft_bill_no:{
                allowNull:false,
                primaryKey:true,
                type: DataTypes.STRING(50)
            },
            fk_invoice_id:{
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            delivery_date:{
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            location:{
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            trip_plan:{
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            shipment_manifest:{
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            dr_no:{
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            invoice_no:{
                allowNull:false,
                primaryKey:true,
                type: DataTypes.STRING(50)
            },
            br_no:{
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            delivery_status:{
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            vehicle_type:{
                type: DataTypes.STRING(50)
            },
            tariff_id:{
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            contract_id:{
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            service_type:{
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            sub_service_type:{
                type: DataTypes.STRING(50)
            },
            min_billable_value:{
                type: DataTypes.DECIMAL(18,9)
            },
            min_billable_unit:{
                type: DataTypes.STRING(50)
            },
            from_geo_type:{
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            ship_from:{
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            to_geo_type:{
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            ship_to:{
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            remarks:{
                type: DataTypes.STRING(50)
            },
            class_of_store:{
                type: DataTypes.STRING(50)
            },
            planned_qty:{
                type: DataTypes.DECIMAL(18,9)
            },
            actual_qty:{
                type: DataTypes.DECIMAL(18,9)
            },
            planned_weight:{
                type: DataTypes.DECIMAL(18,9)
            },
            planned_cbm:{
                type: DataTypes.DECIMAL(18,9)
            },
            actual_weight:{
                type: DataTypes.DECIMAL(18,9)
            },
            actual_cbm:{
                type: DataTypes.DECIMAL(18,9)
            },
            return_qty:{
                type: DataTypes.DECIMAL(18,9)
            },
            billing:{
                type:DataTypes.DECIMAL(18,9)
            },
            createdAt:Sequelize.DATE,
            updatedAt:Sequelize.DATE,

        },
        {
            sequelize,
            freezeTableName:true,
            tableName:'draft_bill_invoice_tbl'
        })
    }
}

module.exports =  draft_bill_invoice_tbl