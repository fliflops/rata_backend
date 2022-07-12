const Sequelize = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('quick_code_tbl',{
        qc_type:{
            primaryKey: true,
			type: DataTypes.STRING(50)
        },
        qc_code:{
            allowNull:false,
            primaryKey: true,
            type: DataTypes.STRING(50)
        },
        qc_name:{
            type: DataTypes.STRING(255)
        },
        sequence_no:{
            type: DataTypes.STRING(255)
        },
        is_active:{
            type: DataTypes.STRING(255)
        },
        created_date:{
            allowNull:false,
            type: Sequelize.DATE
            
        },
        created_by:{
            allowNull:false,
            type: DataTypes.STRING(255)
        },
        modified_date:{
            allowNull:false,
            type: Sequelize.DATE
        },
        modified_by:{
            allowNull:false,
            type: DataTypes.STRING(255)
        }

    },
    {
        timestamps : false,
		freezeTableName : true
    })
}