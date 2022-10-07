const { Sequelize } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('wms_data_header_tbl',{
        wms_reference_no:{
            primaryKey:true,
            type: DataTypes.STRING(255)
        },
        service_type:{
            allowNull:false,
			type: DataTypes.STRING(255)
        },
        location:{
            allowNull:false,
			type: DataTypes.STRING(255)
        },
        principal_code:{
			type: DataTypes.STRING(255)
        },
        primary_ref_doc:{
            allowNull:false,
			type: DataTypes.STRING(255)
        },
        vehicle_type:{
			type: DataTypes.STRING(255)
        },
        transaction_date:{
            allowNull:false,
			type: DataTypes.DATEONLY
        },
        job_id:{
			type: DataTypes.STRING(255)
        },
        is_processed:{
            type: DataTypes.INTEGER
        },
        reason_code:{
            type: DataTypes.STRING(255)
        },
        createdAt:Sequelize.DATE,
        created_by:{
            type: DataTypes.STRING(255)
        },
        updatedAt:Sequelize.DATE,
        updated_by:{
            type: DataTypes.STRING(255)
        }
    },
    {
		freezeTableName : true
	})
}