const { Sequelize,Model,DataTypes } = require('sequelize');

class vendor_tbl extends Model {
    static init(sequelize) {
        return super.init({
            vendor_id:{
                primaryKey:true,
                type: DataTypes.STRING(255)
            },
            vendor_name:{
                allowNull:false,
                type: DataTypes.STRING(255)
            },
            vendor_description:{
                allowNull:false,
                type: DataTypes.STRING(255)
            },
            vendor_code:{
                allowNull:false,
                type: DataTypes.STRING(255)
            },
            vendor_status:{
                type: DataTypes.STRING(255)
            },
            vendor_address:{
                allowNull:false,
                type: DataTypes.STRING(255)
            },
            country:{
                type: DataTypes.STRING(255)
            },
            region:{
                type: DataTypes.STRING(255)
            },
            province:{
                type: DataTypes.STRING(255)
            },
            city:{
                type: DataTypes.STRING(255)
            },
            barangay:{
                type: DataTypes.STRING(255)
            },
            zip_code:{
                type: DataTypes.STRING(255)
            },
            ascii_vendor_code:{
                type: DataTypes.STRING(255)
            },
            is_ic:{
                type:DataTypes.INTEGER
            },
            createdAt:Sequelize.DATE,
            created_by:{
                type: DataTypes.STRING(255)
            },
            updatedAt:Sequelize.DATE,
            updated_by:{
                type: DataTypes.STRING(255)
            }
        },
        {
            sequelize,
            freezeTableName:true,
            tableName:'vendor_tbl'
        })
    }

    static async paginated({
        filters,
        order,
        page,
        totalPage
    }) {
        
        return await this.findAndCountAll({
            where:{
                ...filters
            },
            offset: parseInt(page) * parseInt(totalPage),
            limit:parseInt(totalPage),
            order
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

}

module.exports = vendor_tbl;
