const {Sequelize,DataTypes,Model} = require('sequelize')

class role_modules_tbl extends Model {
    static init(sequelize) {
        return super.init({
            id:{
                allowNull: false,
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            }, 
            role_id:{
                allowNull:false,
                type: DataTypes.STRING
            },
            module_name:{
                allowNull:false,
                type: DataTypes.STRING
            },
            module_label:{
                allowNull:false,
                type: DataTypes.STRING
            },
            route:{
                allowNull:false,
                type: DataTypes.STRING
            },
            sub_module_name:{
                allowNull:false,
                type: DataTypes.STRING
            },
            sub_module_label:{
                allowNull:false,
                type: DataTypes.STRING
            },
            sub_module_route:{
                allowNull:false,
                type: DataTypes.STRING
            },
            has_access:{
                allowNull:false,
                type: DataTypes.STRING
            },
            createdAt:Sequelize.DATE,
            updatedAt:Sequelize.DATE,
            created_by:{
                type: DataTypes.STRING
            },
            modified_by:{
                type: DataTypes.STRING
            }

        },
        {
            freezeTableName:true,
            sequelize,
            tableName:'role_modules_tbl'
        })
    }

    static async getAllRoleModules (where) {
        return this.findAll({
            where:{
                ...where
            }
        })
    }


}

module.exports=role_modules_tbl