const {Sequelize,Model,DataTypes} = require('sequelize')

class quick_code_tbl extends Model {
    static init (sequelize) {
        return super.init({
            qc_type:{
                primaryKey: true,
                type: DataTypes.STRING(50)
            },
            qc_code:{
                allowNull:false,
                primaryKey: true,
                type: DataTypes.STRING(50)
            },
            qc_name:{
                type: DataTypes.STRING(255)
            },
            sequence_no:{
                type: DataTypes.STRING(255)
            },
            is_active:{
                type: DataTypes.STRING(255)
            },
            created_date:{
                allowNull:false,
                type: Sequelize.DATE
                
            },
            created_by:{
                allowNull:false,
                type: DataTypes.STRING(255)
            },
            modified_date:{
                allowNull:false,
                type: Sequelize.DATE
            },
            modified_by:{
                allowNull:false,
                type: DataTypes.STRING(255)
            }
        },
        {
            sequelize,
            tableName:'quick_code_tbl',
            freezeTableName: true,
            timestamps: false
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

    static async getData({options,where}) {
        return await this.findAll({
            where:{
                ...where
            },
            ...options
        })
        .then(result => JSON.parse(JSON.stringify(result)))
    }

} 

module.exports = quick_code_tbl