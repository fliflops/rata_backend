const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('wms_rev_leak_tbl',{
        wms_reference_no:{
            type: DataTypes.STRING(50),
            allowNull:false,
            primaryKey: true,
        },		
        fk_wms_reference_no:{type: DataTypes.STRING(50)},	    
        fk_soh_reference_no:{type: DataTypes.STRING(50)},     
        principal_code:{type: DataTypes.STRING(50)},							
        location:{type: DataTypes.STRING(50)},				
        service_type:{type: DataTypes.STRING(50)},			
        transaction_date :{type: DataTypes.DATEONLY},		
        job_id	:{type: DataTypes.STRING(50)},				
        contract_id	:{type: DataTypes.STRING(50)},			
        uom		:{type: DataTypes.STRING(50)},				
        tariff_id:{type: DataTypes.STRING(50)},				
        leak_reason	:{type: DataTypes.STRING(50)},	
        is_draft_bill: {type: DataTypes.STRING(1)},	
        created_by:{type: DataTypes.STRING(50)},
        updated_by:{type: DataTypes.STRING(50)},
        createdAt:Sequelize.DATE,
        updatedAt:Sequelize.DATE,  
    },
    {
        freezeTableName : true
    })
}