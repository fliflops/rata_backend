const { Model, Sequelize, DataTypes } = require('sequelize');

class wms_rev_leak_tbl extends Model {
    static init(sequelize) {
        return super.init({
            wms_reference_no: {
                type: DataTypes.STRING(50),
                allowNull: false,
                primaryKey: true,
            },
            fk_wms_reference_no: { type: DataTypes.STRING(50) },
            fk_soh_reference_no: { type: DataTypes.STRING(50) },
            principal_code: { type: DataTypes.STRING(50) },
            location: { type: DataTypes.STRING(50) },
            service_type: { type: DataTypes.STRING(50) },
            transaction_date: { type: DataTypes.DATEONLY },
            job_id: { type: DataTypes.STRING },
            contract_id: { type: DataTypes.STRING(50) },
            uom: { type: DataTypes.STRING(50) },
            tariff_id: { type: DataTypes.STRING(50) },
            leak_reason: { type: DataTypes.STRING(50) },
            is_draft_bill: { type: DataTypes.TINYINT(1) },
            created_by: { type: DataTypes.STRING(50) },
            updated_by: { type: DataTypes.STRING(50) },
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE,

        },
            {
                sequelize,
                tableName: 'wms_rev_leak_tbl',
                freezeTableName: true
            })
    }

    static async getData({ where, options }) {
        return await this.findAll({
            ...options,
            where: {
                ...where
            }
        })
            .then(result => JSON.parse(JSON.stringify(result)))
    }

    static async paginated({
        filters,
        options,
        order,
        page,
        totalPage }) {
        const { search, ...newFilters } = filters

        return await this.findAndCountAll({
            where: {
                ...newFilters
            },
            ...options,
            distinct: true,
            offset: parseInt(page) * parseInt(totalPage),
            limit: parseInt(totalPage),
            order
        })
            .then(result => JSON.parse(JSON.stringify(result)))
    }

    static async updateData({ data, options, where }) {
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

}

module.exports = wms_rev_leak_tbl