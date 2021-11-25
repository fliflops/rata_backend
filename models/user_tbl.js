const { Sequelize } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('user_tbl',{
        id:{
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4            
        },
        email:{
            allowNull:false,
			type: DataTypes.STRING(255)
        },
        first_name:{
            allowNull:false,
            type: DataTypes.STRING(50)
        },
        last_name:{
            allowNull:false,
            type: DataTypes.STRING(50)
        },
        status:{
            allowNull:false,
            type: DataTypes.STRING(50)
        },
        remarks:{
            type: DataTypes.STRING(50)
        },
        role_id:{
            type: DataTypes.STRING(50)
        },
        password:{
            allowNull:false,
            type: DataTypes.STRING(255)
        },
        created_by:{
            type: DataTypes.STRING(50)
        },
        updated_by:{
            type: DataTypes.STRING(50)
        },
        deleted_by:{
            type: DataTypes.STRING(50)
        },
        createdAt:Sequelize.DATE,
        updatedAt:Sequelize.DATE,
        deletedAt:Sequelize.DATE
    },
    {
		freezeTableName : true
	})
}