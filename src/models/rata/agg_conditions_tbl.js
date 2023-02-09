const {Sequelize, Model, DataTypes} = require('sequelize');

class agg_conditions_tbl extends Model {
    static init (sequelize) {
        return super.init({
            agg_id:{
                primaryKey:true,
                type:DataTypes.STRING(50)
            },
            line_no:{
                primaryKey:true,
                type:DataTypes.INTEGER
            },
            raw_formula:{
                type:DataTypes.STRING(255)
            },
            raw_condition:{
                type:DataTypes.STRING(255)
            }
        },
        {
            sequelize,
            freezeTableName:true,
            timestamps:false,
            tableName:'agg_conditions_tbl'
        })
    }

    static async bulkCreateData({data,options}) {
        this.bulkCreate(data,{
            ...options
        })
    }

    static async getData({options,where}) {
        return await this.findAll({
            where:{
                ...where
            },
            ...options
        })
        .then(result => JSON.parse(JSON.stringify(result)))
    }

    static associate(models) {
        this.agg = this.belongsTo(models.agg_tbl,{
            foreignKey:'agg_id'
        })
    }
}

module.exports = agg_conditions_tbl