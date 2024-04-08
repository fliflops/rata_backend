const {Model, DataTypes} = require('sequelize'); 

class cost_alloc_setup_tbl extends Model {
    static init (sequelize) {
        return super.init({
            id:{
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            service_type:{
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            draft_bill_type:{
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            is_active:{
                type: DataTypes.BOOLEAN
            },
            created_by:{
                type: DataTypes.STRING(50)
            },
            createdAt:{
                type: DataTypes.DATE
            },
            updated_by:{
                type: DataTypes.STRING(50)
            },
            updatedAt:{
                type: DataTypes.DATE
            }
        },
        {
            sequelize,
            freezeTableName:true,
            timestamps:true,
            tableName:'cost_alloc_setup_tbl'
        })
    }

}

module.exports = cost_alloc_setup_tbl;