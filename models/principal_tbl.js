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
        principal_status:{
            allowNull:true,
            type: DataTypes.BOOLEAN()
        },
        created_date:{
            allowNull:false,
            type: DataTypes.STRING(50)
            
        },
        modified_date:{
            allowNull:false,
            type: DataTypes.STRING(50)
        }
    },
    {
        timestamps : false,
		freezeTableName : true
    })
}