const {Sequelize,Model,DataTypes} = require('sequelize');

class agg_tbl extends Model {
    static init(sequelize) {
        return super.init({
            id:{
                primaryKey: true,
                allowNull:false,
                type: DataTypes.STRING(255)
            },
            agg_name:{
                allowNull:false,
                type: DataTypes.STRING(255)
            },
            algo_description:{
                allowNull:false,
                type: DataTypes.STRING(255)
            },
            with_agg:{
                allowNull:false,
                type:DataTypes.BOOLEAN
            },
            parameter:{
                type: DataTypes.STRING(255)
            },
            group_by:{
                type: DataTypes.STRING(255)
    
            },
            status:{
                allowNull:false,
                type: DataTypes.STRING(255)
            },
            createdAt:Sequelize.DATE,
            updatedAt:Sequelize.DATE,
            created_by:{
                type: DataTypes.STRING(255)
            },
            modified_by:{
                type: DataTypes.STRING(255)
            }

        },
        {
            sequelize,
            tableName:'agg_tbl',
            freezeTableName:true
        })
    }

    static associate(models) {  
        this.conditions = this.hasMany(models.agg_conditions_tbl,{
            foreignKey:'agg_id',
	        sourceKey:'id'
        })
    }
}

module.exports = agg_tbl;