const {Sequelize,Model,DataTypes} = require('sequelize');

class role_access_tbl extends Model {
    static init(sequelize) {
        return super.init({
            role_id:{
                primaryKey:true,
                type: DataTypes.STRING
            },
            id:{
                primaryKey:true,
                type: DataTypes.STRING
            },
            sequence_no:{
                type: DataTypes.INTEGER
            },
            header_id:{
                primaryKey:true,
                type: DataTypes.STRING
            },
            label:{
                type: DataTypes.STRING
            },
            is_header:{
                type: DataTypes.BOOLEAN
            },
            view:{
                type: DataTypes.BOOLEAN
            },
            create:{
                type: DataTypes.BOOLEAN
            },
            edit:{
                type: DataTypes.BOOLEAN
            },
            export:{
                type: DataTypes.BOOLEAN
            },
            createdAt: DataTypes.DATE,
            updatedAt: DataTypes.DATE,
            createdBy: DataTypes.STRING,
            updatedBy: DataTypes.STRING
        },
        {
            sequelize,
            tableName:'role_access_tbl',
            freezeTableName:true
        })
    }

    static async bulkCreateData ({data,options}) {
        return await this.bulkCreate(data,{
            ...options
        })
    }
}

module.exports = role_access_tbl