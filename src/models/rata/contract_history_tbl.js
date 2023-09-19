const {Sequelize,Model,DataTypes} = require('sequelize');

class contract_history_tbl extends Model {
    static init(sequelize) {
        return super.init({
            id:{
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },  
            contract_id: {
                type: DataTypes.STRING(50)
            },
            valid_from:{
                type: DataTypes.DATE
            },
            valid_to:{
                type: DataTypes.DATE
            },
            createdAt:Sequelize.DATE,
            updatedAt:Sequelize.DATE,
            created_by: DataTypes.STRING,
            updated_by: DataTypes.STRING
        },{
            sequelize,
            freezeTableName:true,
            tableName:'contract_history_tbl'
        })
    }
}

module.exports = contract_history_tbl;