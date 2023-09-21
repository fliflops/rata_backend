const {Model,Sequelize,DataTypes} = require('sequelize');

class draft_bill_hdr_tbl extends Model {
    static init (sequelize) {
        return super.init({
            draft_bill_no:{
                allowNull:false,
                primaryKey: true,
                type: DataTypes.STRING(50)
            },
            customer:{
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            contract_type:{
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            draft_bill_date:{
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            delivery_date:{
                allowNull:false,
                type: DataTypes.DATEONLY
            },
            contract_id:{
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            tariff_id:{
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            trip_no:{
                allowNull:true,
                type: DataTypes.STRING(50)
            },
            vendor:{
                allowNull:true,
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
            stc_from:{
                allowNull:false,
                type: DataTypes.STRING(50)
            },
            stc_to:{
                allowNull:false,
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
                type: DataTypes.DECIMAL(18,9)
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
            sub_service_type:{
                type: DataTypes.STRING(50)
            },
            job_id:{
                type: DataTypes.STRING
            },
            // is_transmitted:{
            //     type: DataTypes.BOOLEAN
            // },
            created_by:{type: DataTypes.STRING(50)},
            updated_by:{type: DataTypes.STRING(50)},
            createdAt:Sequelize.DATE,
            updatedAt:Sequelize.DATE,    
        },
        {
            tableName:'draft_bill_hdr_tbl',
            freezeTableName:true,
            sequelize
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
            offset: parseInt(page) * parseInt(totalPage),
            limit:parseInt(totalPage),
            order
        })
        .then(result => JSON.parse(JSON.stringify(result)))
    }

    static async getData ({where,options}) {
        return await this.findAll({
            ...options,
            where:{
                ...where
            }
        })
        .then(result => JSON.parse(JSON.stringify(result)))
    }

    static async bulkCreateData ({data,options}) {
        return await this.bulkCreate(data,{
            ...options
        })
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
    
    static associate (models) {
        this.details = this.hasMany(models.draft_bill_details_tbl,{
            foreignKey:'draft_bill_no',
            sourceKey:'draft_bill_no',
            as:'details'
        })

        this.location = this.hasOne(models.location_tbl,{
            foreignKey:'loc_code',
            sourceKey:'location'
        })

        this.vendor = this.hasOne(models.vendor_tbl,{
            foreignKey:'vendor_id',
            sourceKey: 'vendor'
        })

        this.principal = this.hasOne(models.principal_tbl,{
            foreignKey:'principal_code',
            sourceKey:'customer'
        })

        this.service_type = this.hasOne(models.service_type_tbl,{
            foreignKey:'service_type_code',
            sourceKey:'service_type'
        })
        this.tariff = this.hasOne(models.tariff_sell_hdr_tbl,{
            sourceKey:'tariff_id',
            foreignKey:'tariff_id',
            as:'tariff'
        })
    }
 }


module.exports = draft_bill_hdr_tbl;