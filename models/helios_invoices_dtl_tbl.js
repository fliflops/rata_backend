const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('helios_invoices_dtl_tbl',{
        id:{
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4

        },
        br_no:{
            allowNull: false,
            type:DataTypes.STRING(255)
        },
        trip_no:{
            allowNull: false,
            type:DataTypes.STRING(50)
        },
        class_of_store:{
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
        updatedAt:Sequelize.DATE,
        createdBy: {
            type:DataTypes.STRING(50)
        },
        updatedBy:{
            type:DataTypes.STRING(50)
        }
    },{
        freezeTableName : true
    })
}