const Sequelize = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('principal_tbl',{
        principal_code:{
            primaryKey: true,
			type: DataTypes.STRING(50)
        },
        principal_name:{
            allowNull:false,
            type: DataTypes.STRING(50)
        },
        description:{
            type: DataTypes.STRING(255)
        },
        address:{
            type: DataTypes.STRING(255)
        },
        is_active:{
            type: DataTypes.INTEGER
        },
        ascii_principal_code:{
            type: DataTypes.STRING(255)
        },
        ascii_customer_code:{
            type: DataTypes.STRING(255)
        },
        created_date:{
            allowNull:false,
            type: Sequelize.DATE
        },
        modified_date:{
            allowNull:false,
            type: Sequelize.DATE
        }
    },
    {
        timestamps : false,
		freezeTableName : true
    })
}