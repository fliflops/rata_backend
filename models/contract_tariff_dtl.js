const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const contract_tariff_dtl = sequelize.define('contract_tariff_dtl',{
       id:{
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
       },
       contract_id:{
            allowNull:false,
            type: DataTypes.STRING(50)
       },
       tariff_type:{
            allowNull:false,
            type: DataTypes.STRING(50)
       },
       tariff_id:{
            allowNull:false,
            type: DataTypes.STRING(50)
       },
       line_no:{
            allowNull:false,
            type: DataTypes.INTEGER
       },
       tariff_rate:{
            allowNull:false,
            type: DataTypes.DECIMAL(18,9)
       },
       fk_agg_id:{
          type: DataTypes.STRING(36)
       },
       valid_from:{
            allowNull:false,
            type: DataTypes.STRING(50)
       },
       valid_to:{
        allowNull:false,
        type: DataTypes.STRING(50)
       },
       status:{
        allowNull:false,
        type: DataTypes.STRING(50)
       },
       created_by:{
        allowNull:false,
        type: DataTypes.STRING(50)
       },
       modified_by:{
        allowNull:false,
        type: DataTypes.STRING(50)
       },
       createdAt:Sequelize.DATE,
       updatedAt:Sequelize.DATE, 
    },
    {
        freezeTableName : true
    })

    return contract_tariff_dtl
}