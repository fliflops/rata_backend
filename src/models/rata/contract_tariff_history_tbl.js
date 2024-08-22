const {Sequelize,Model,DataTypes} = require('sequelize');

class contract_tariff_history_tbl extends Model {
    static init(sequelize) {
        return super.init({
            id:{
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            fk_contract_tariff_id:{
                type: DataTypes.STRING(50)
            },
            old_valid_to:{
                type: DataTypes.DATE
            },
            new_valid_to:{
                type: DataTypes.DATE
            },
            created_by:{
                type: DataTypes.STRING
            }, 
            udpated_by:{
                type: DataTypes.STRING
            },
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
        },
        {
            sequelize,
            freezeTableName: true,
            tableName: 'contract_tariff_history_tbl'  
        })
    }

    static associate (models) {
        this.contract_tariff = this.hasOne(models.contract_tariff_dtl, {
            foreignKey: 'id',
            sourceKey: 'fk_contract_tariff_id'
        })
    }
}

module.exports = contract_tariff_history_tbl;