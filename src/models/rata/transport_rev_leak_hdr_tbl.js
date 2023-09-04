const {Sequelize,DataTypes,Model} = require('sequelize');

class transport_rev_leak_hdr_tbl extends Model {
    static init (sequelize) {
        return super.init({
            tms_reference_no: {
                primaryKey:true,
                type: DataTypes.STRING
            },
            draft_bill_type: {  
                primaryKey:true,
                type: DataTypes.STRING
            },
            class_of_store: {
                type: DataTypes.STRING
            },
            fk_tms_reference_no: {
                type: DataTypes.STRING
            },
            rdd: {
                type: DataTypes.DATEONLY
            },
            job_id: {
                type: DataTypes.STRING
            },
            revenue_leak_reason: {
                type: DataTypes.STRING
            },
            is_draft_bill: {
                type: DataTypes.TINYINT
            },
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE,
            created_by: {
                type: DataTypes.STRING
            },
            updated_by: {
                type: DataTypes.STRING
            }
        },
        {
            sequelize,
            freezeTableName:true,
            tableName:'transport_rev_leak_hdr_tbl',
            
        })
    }

    static async getData ({where,options}) {
        return await this.findAll({
            ...options,
            where:{
                ...where
            }
        }).then(result => JSON.parse(JSON.stringify(result)))
    }

    static async bulkCreateData ({data,options}) {
        return await this.bulkCreate(data,
        {
            ...options
        })
    }

    static async updateData ({data,options,where}) {
        return await this.update(data,{
            where:{
                ...where
            },
            ...options
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

    static associate(models) {
        this.helios_info = this.hasOne(models.helios_invoices_hdr_tbl,{
            foreignKey:'tms_reference_no',
            sourceKey:'tms_reference_no'
        })

        this.details = this.hasMany(models.tranport_rev_leak_dtl_tbl,{
            foreignKey:'br_no',
            sourceKey:'tms_reference_no',  
        })
    }


}

module.exports = transport_rev_leak_hdr_tbl;