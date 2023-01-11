const { Model, Sequelize, DataTypes} = require('sequelize');

class wms_draft_bill_hdr_tbl extends Model {
    static init (sequelize) {
        return super.init({
            draft_bill_no:{
                allowNull:false,
                primaryKey: true,
                type: DataTypes.STRING(50)
            },
            principal:{
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            draft_bill_date:{
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            contract_id:{
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            tariff_id:{
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            location:{
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            rate:{
                allowNull:false,
                type: DataTypes.DECIMAL(18,9)
            },
            vehicle_type:{
                allowNull:true,
                type: DataTypes.STRING(50)
            },
            min_billable_value:{
                allowNull:false,
                type: DataTypes.DECIMAL(18,9)
            },
            max_billable_value:{
                type: DataTypes.DECIMAL(18,9)
            },
            min_billable_unit:{
                type: DataTypes.STRING(50)
            },
            total_charges:{
                allowNull:false,
                type: DataTypes.DECIMAL(18,2)
            },
            total_cbm:{
                allowNull:false,
                type: DataTypes.DECIMAL(18,2)
            },
            
            total_qty:{
                type: DataTypes.DECIMAL(18,2)
            },
            
            total_billing_qty:{      
                type: DataTypes.DECIMAL(18,2)
            },
            status:{
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            condition:{
                type: DataTypes.STRING(255)
            },
            formula:{
                type: DataTypes.STRING(255)
            },
            service_type:{
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            job_id:{
                type: DataTypes.STRING(50)
            },
            created_by:{type: DataTypes.STRING(50)},
            updated_by:{type: DataTypes.STRING(50)},
            createdAt:Sequelize.DATE,
            updatedAt:Sequelize.DATE    
        },
        {
            tableName:'wms_draft_bill_hdr_tbl',
            sequelize,
            freezeTableName:true
        })
    }

    static async getData({where,options}) {
        return await this.findAll({
            ...options,
            where:{
                ...where
            }
        })
        .then(result => JSON.parse(JSON.stringify(result)))
    }

    static async updateData ({data,options,where}) {
        return await this.update({
            ...data
        },
        {
            where: {
                ...where
            },
            ...options
        })
    }

    static async paginated ({
        filters,
        options,
        order,
        page,
        totalPage}) {
        const {search,...newFilters} = filters

        return await this.findAndCountAll({
            where:{
                ...newFilters
            },
            ...options,
            distinct:true,
            offset: parseInt(page) * parseInt(totalPage),
            limit:parseInt(totalPage),
            order
        })
        .then(result => JSON.parse(JSON.stringify(result)))
    }

    static associate (models) {
        this.details = this.hasMany(models.wms_draft_bill_dtl_tbl,{
            foreignKey:'draft_bill_no',
            sourceKey:'draft_bill_no',
            as: 'details'
        })

        this.principal = this.hasOne(models.principal_tbl,{
            foreignKey:'principal_code',
            sourceKey:'principal',
        })

        this.service_type = this.hasOne(models.service_type_tbl,{
            foreignKey:'service_type_code',
            sourceKey:'service_type'
        })

        this.location = this.hasOne(models.location_tbl, {
            foreignKey:'loc_code',
            sourceKey:'location'
        })
    }
}   

module.exports = wms_draft_bill_hdr_tbl