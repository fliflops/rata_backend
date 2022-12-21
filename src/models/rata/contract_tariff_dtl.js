const {Sequelize,Model,DataTypes} = require('sequelize');

class contract_tariff_dtl extends Model {
    static init (sequelize) {
        return super.init({
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
           tariff_id:{
                allowNull:false,
                type: DataTypes.STRING(50)
           },
           line_no:{
                allowNull:true,
                type: DataTypes.INTEGER
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
            //allowNull:false,
            type: DataTypes.STRING(50)
           },
           modified_by:{
            //allowNull:false,
            type: DataTypes.STRING(50)
           },
           createdAt:Sequelize.DATE,
           updatedAt:Sequelize.DATE, 
        },
        {
            sequelize,
            freezeTableName:true,
            tableName:'contract_tariff_dtl'
        })
    }

    static async paginated({
        filters,
        options,
        order,
        page,
        totalPage
    }) {
        const {search,...newFilters} = filters

        return await this.findAndCountAll({
            where:{
                ...newFilters
            },
            ...options,
            offset: parseInt(page) * parseInt(totalPage),
            limit:parseInt(totalPage),
            order
        })
        .then(result => JSON.parse(JSON.stringify(result)))
    }

    static associate (models) {
        this.tariff = this.hasOne(models.tariff_sell_hdr_tbl,{
            foreignKey:'tariff_id',
            sourceKey:'tariff_id'
        })

        this.algorithm = this.hasOne(models.agg_tbl,{
            foreignKey:'id',
            sourceKey:'fk_agg_id'
        })

        this.algorithm_conditions = this.hasMany(models.agg_conditions_tbl,{
            foreignKey:'agg_id',
            sourceKey:'fk_agg_id'
        })

        this.ic_algo = this.hasMany(models.tariff_ic_algo_tbl,{
            foreignKey:'tariff_id',
            sourceKey:'tariff_id'
        })
    }
}

module.exports = contract_tariff_dtl