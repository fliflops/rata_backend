const models = require('../../models');
const { sequelize,Sequelize } = models;
const {viewFilters} = require('../../helper')

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

// const formatFilters = ({
//     model,
//     filters
// }) => {
//     try{
//         let formattedFilters = filters;
//         const attributes = Object.keys(model)
//         Object.keys(filters).map(field => {
//             if(field==='search'){
//                 let fields = []

//                 for(const attribute of attributes){
//                     fields.push({
//                         [attribute]:{
//                             [Sequelize.Op.like]:'%'+filters.search+'%'
//                         }
//                     })
//                 }

//                 formattedFilters={
//                     ...formattedFilters,
//                     [Sequelize.Op.or]:fields
//                 }

//                 delete formattedFilters["search"]
//             }
//         })

//         return formattedFilters
//     }
//     catch(e){
//         throw e
//     }
// }


const getPaginatedRole = async({
    filters,
    page,
    totalPage
})=>{
    try{

        const filter = viewFilters.globalSearchFilter({
            model:models.role_tbl.rawAttributes,
            filters
        })
        
        const {count,rows} = await models.role_tbl.findAndCountAll({
            offset:parseInt(page) * parseInt(totalPage),
            limit:parseInt(totalPage),
            where:{
                ...filter
            }
        })
        .then(result => {
            let {count,rows} = JSON.parse(JSON.stringify(result))
            return {
                count,
                rows
            }
        })
        
        return {
            count,rows
        }
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
    getRoleModule,
    getPaginatedRole
}
