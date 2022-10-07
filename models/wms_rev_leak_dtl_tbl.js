const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('wms_rev_leak_dtl_tbl',{
        id:{
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull:false,
            primaryKey: true,
        },					
        wms_reference_no	:{type: DataTypes.STRING(50)},
        fk_wms_reference_no	:{type: DataTypes.STRING(50)},
        primary_ref_doc		:{type: DataTypes.STRING(50)},
        sku_code			:{type: DataTypes.STRING(50)},
        uom				    :{type: DataTypes.STRING(50)},	
        actual_qty		    :{type: DataTypes.DECIMAL(18,2)},	
        actual_cbm			:{type: DataTypes.DECIMAL(18,2)},
        class_of_store		:{type: DataTypes.STRING(50)},
        created_by          :{type: DataTypes.STRING(50)},
        updated_by          :{type: DataTypes.STRING(50)},
        createdAt           :Sequelize.DATE,
        updatedAt           :Sequelize.DATE,  
    },
    {
        freezeTableName : true
    })
}