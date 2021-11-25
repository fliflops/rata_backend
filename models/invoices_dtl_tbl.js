const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('invoices_dtl_tbl',{
        id:{
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4

        },
        fk_invoice_id:{
            allowNull: false,
            type:DataTypes.STRING(50)
        },
        trip_no:{
            allowNull: false,
            type:DataTypes.STRING(50)
        },
        br_no:{
            allowNull: false,
            type:DataTypes.STRING(50)
        },
        class_of_store:{
            allowNull: false,
            type:DataTypes.STRING(50)
        },
        uom:{type:DataTypes.STRING(50)},
        planned_qty:{type:DataTypes.DECIMAL(18,9)},
        planned_weight:{type:DataTypes.DECIMAL(18,9)},
        planned_cbm:{type:DataTypes.DECIMAL(18,9)},
        actual_qty:{type:DataTypes.DECIMAL(18,9)},
        actual_weight:{type:DataTypes.DECIMAL(18,9)},
        actual_cbm:{type:DataTypes.DECIMAL(18,9)},
        return_qty:{type:DataTypes.DECIMAL(18,9)},
        createdAt:Sequelize.DATE,
        updatedAt:Sequelize.DATE
    },{
        // timestamps : false,
		freezeTableName : true
    })
}