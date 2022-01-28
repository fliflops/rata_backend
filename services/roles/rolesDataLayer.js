const models = require('../../models');
const { sequelize } = models

const createRoleHeader = async({data,options}) => {
    try{
        return await models.role_tbl.create({
            ...data
        },{
            ...options
        })
    }
    catch(e){
        throw e
    }
}

const bulkCreateRoleModules = async({
    data,options
}) => {
    try{
        return await models.role_modules_tbl.bulkCreate(data,{
            ...options
        })
    }
    catch(e){
        throw e
    }
}

const createModuleTransaction = async({
    header,
    details
}) => {
    try{
    //     console.log(header)
    //     console.log(details)
        return await sequelize.transaction(async t => {
            const createdRoleHeader = await createRoleHeader({
                data:header,
                options:{
                    transaction:t
                }
            })

            // console.log(createdRoleHeader.role_id)
            await bulkCreateRoleModules({
                data:details.map(item => {
                    return {
                        ...item,
                        role_id:createdRoleHeader.role_id
                    }
                }),
                options:{
                    transaction:t
                }
            })
        })

    }
    catch(e){
        throw e
    }
}

const getAllRoles = async({
    filters
}) => {
    try{

        return await models.role_tbl.findAll({
            where:{
                ...filters
            }
        })
        .then(res => JSON.parse(JSON.stringify(res)))

    }
    catch(e){
        throw e
    }

}

const getRoleModule = async({
    filters
}) => {
    try{
        return await models.role_modules_tbl.findAll({
            where:{
                ...filters
            }
        })
        .then(res => JSON.parse(JSON.stringify(res)))

    }
    catch(e){
        throw e
    }
}



module.exports = {
    createRoleHeader,
    bulkCreateRoleModules,
    createModuleTransaction,
    getAllRoles,
    getRoleModule
}
