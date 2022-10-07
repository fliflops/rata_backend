const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('contract_tariff_wms_tbl',{
       id:{
          allowNull: false,
          primaryKey: true,
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4
       },
       line_no:{
          allowNull:true,
          type: DataTypes.INTEGER
       },
       contract_id:{
          allowNull:false,
          type: DataTypes.STRING(50)
       },
       tariff_id:{
          allowNull:false,
          type: DataTypes.STRING(50)
       },
       tariff_rate:{
            allowNull:false,
            type: DataTypes.DECIMAL(18,9)
       },
       fk_agg_id:{
          allowNull:false,
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
        type: DataTypes.STRING(50)
       },
       updated_by:{
        type: DataTypes.STRING(50)
       },
       createdAt:Sequelize.DATE,
       updatedAt:Sequelize.DATE, 
    },
    {
        freezeTableName : true
    })

}