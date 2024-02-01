const {Model,Sequelize,DataTypes} = require('sequelize');

class draft_bill_cost_alloc_tbl extends Model {
    static init (sequelize) {
        return super.init({
            id:{
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            draft_bill_no:{
                type: DataTypes.STRING
            },
            trip_no:{
                type: DataTypes.STRING
            },
            service_type:{
                type: DataTypes.STRING
            },
            vendor_id:{
                type: DataTypes.STRING
            },
            principal_code:{
                type: DataTypes.STRING
            },
            total_cbm:{
                type: DataTypes.DECIMAL
            },
            vehicle_capacity:{
                type: DataTypes.DECIMAL
            },
            allocation:{
                type: DataTypes.DECIMAL
            },
            allocated_cost:{
                type: DataTypes.DECIMAL
            },
            total_cost:{
                type: DataTypes.DECIMAL
            },
            createdAt: DataTypes.DATE,
            updatedAt:DataTypes.DATE,
        },
        {
            sequelize,
            freezeTableName:true,
            timestamps:true,
            tableName:'draft_bill_cost_alloc_tbl'
        })
    }

    static associate(models) {
        this.hasOne(models.draft_bill_hdr_tbl,{
            sourceKey:'draft_bill_no',
            foreignKey:'draft_bill_no'
        })
    }
}

module.exports=draft_bill_cost_alloc_tbl