const {Sequelize,Model,DataTypes} = require('sequelize');

class ship_point_tbl extends Model { 
    static init(sequelize) {
        return super.init({
            stc_code:{
                primaryKey:true,
                type:DataTypes.STRING(50)
            },
            stc_description:{
                type:DataTypes.STRING(255)
            },
            stc_name:{type:DataTypes.STRING(255)},
            stc_address:{type:DataTypes.STRING(255)},
            long:{type:DataTypes.DECIMAL(18,9)},
            lat:{type:DataTypes.DECIMAL(18,9)},
            country:{type:DataTypes.STRING(50)},
            region:{type:DataTypes.STRING(50)},
            province:{type:DataTypes.STRING(50)},
            city:{type:DataTypes.STRING(50)},
            barangay:{type:DataTypes.STRING(50)},
            zip_code:{
                type:Sequelize.DataTypes.INTEGER
            },
            is_active:{
                type:Sequelize.DataTypes.BOOLEAN
            },
            createdAt:Sequelize.DATE,
            updatedAt:Sequelize.DATE,
            modified_by:{
                type:DataTypes.STRING(50)
            },
            created_by:{
                type:DataTypes.STRING(50)
            }
        },
        {
            freezeTableName:true,
            tableName:'ship_point_tbl',
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

module.exports = ship_point_tbl;