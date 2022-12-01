const {Sequelize,DataTypes,Model} = require('sequelize')

class helios_invoices_dtl_tbl extends Model {
    static init(sequelize) {
        return super.init({
            id: {
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            trip_no:{
                type: DataTypes.STRING
            },
            br_no:{
                type: DataTypes.STRING
            },
            class_of_store:{
                type: DataTypes.STRING
            },
            uom:{
                type: DataTypes.STRING
            },
            planned_qty:{
                type: DataTypes.DECIMAL
            },
            planned_weight:{
                type: DataTypes.DECIMAL
            },
            planned_cbm:{
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
            return_qty:{
                type: DataTypes.DECIMAL
            },
            createdAt:Sequelize.DATE,
            updatedAt:Sequelize.DATE,
            // created_by:{
            //     type: DataTypes.STRING
            // },
            // updated_by:{
            //     type: DataTypes.STRING
            // }
        },
        {
            freezeTableName:true,
            sequelize,
            tableName:'helios_invoices_dtl_tbl'
        })
    }
}

module.exports = helios_invoices_dtl_tbl
