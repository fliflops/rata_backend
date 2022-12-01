const {Sequelize,DataTypes,Model} = require('sequelize')
const {defaultFilter} = require('../../helpers/filters');

class tariff_ic_algo_tbl extends Model {
    static init (sequelize) {
        return super.init({
            id: {
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            seq_no: {
                type: DataTypes.INTEGER
            },
            tariff_id: {
                type: DataTypes.STRING
            },
            vendor_group: {
                type: DataTypes.STRING
            },
            vehicle_type: {
                type: DataTypes.STRING
            },
            uom: {
                type: DataTypes.STRING
            },
            min_value: {
                type: DataTypes.DECIMAL
            },
            max_value: {
                type: DataTypes.DECIMAL
            },
            rate: {
                type: DataTypes.DECIMAL
            },
            algo_status: {
                type: DataTypes.STRING
            },
            createdAt:Sequelize.DATE,
            updatedAt:Sequelize.DATE,
            created_by:{
                type: DataTypes.STRING
            },
            updated_by:{
                type: DataTypes.STRING
            }
        },
        {
            freezeTableName:true,
            sequelize,
            tableName:'tariff_ic_algo_tbl'
        })
    }

    static async bulkCreateData ({data,options}) {
        return await this.bulkCreate(data,{
            ...options,
            updateOnDuplicate:['updatedAt','updated_by','algo_status']
        })
    }

    static async createData ({data,options}) {
        return await this.create(data,{
            ...options
        })
    }

    static async updateData ({data,options,where}) {
        return await this.update({
            ...data
        },
        {
            where:{
                ...where
            },
            ...options
        })
    }

    static async paginated ({
        filters,
        order,
        page,
        totalPage
    }) {

        // let newFilter = defaultFilter({
        //     model:this.rawAttributes,
        //     filters:{
        //         ...filters
        //     }
        // })

        const {search,...newFilters} = filters

        return await this.findAndCountAll({   
            where:{
                ...newFilters
            },
            offset: parseInt(page) * parseInt(totalPage),
            limit:parseInt(totalPage),
            order
        })
    }
}

module.exports = tariff_ic_algo_tbl;