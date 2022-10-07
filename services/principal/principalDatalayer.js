const models = require('../../models');
const {sequelize,Sequelize} = models;
const {useFormatFilters,viewFilters} = require('../../helper')

const getPrincipal = async ({
    page,
    totalPage,
    search
}) => {
    try{
        return await sequelize.query(`sp_get_principal :search,:page,:totalPage`,{
            replacements:{
                page:page,
                totalPage:totalPage,
                search:search
            },
            type:Sequelize.QueryTypes.SELECT
        })
    }
    catch(e){
        throw e
    }
}

const getPaginatedPrincipal = async({
    filters,
    orderBy,
    page,
    totalPage
})=>{
    try{
        const attributes = Object.keys(models.principal_tbl.rawAttributes)
        let where = viewFilters.globalSearchFilter({
            model:models.principal_tbl.rawAttributes,
            filters
        })

        return await models.principal_tbl.findAndCountAll({
            where:{
                ...where
            },
            offset:parseInt(page) * parseInt(totalPage),
            limit:parseInt(totalPage)
        })
        .then(result => {
            let {count,rows} = JSON.parse(JSON.stringify(result))
            return {
                count,
                rows
            }
        })
    }
    catch(e){
        throw e
    }
}

const getAllPrincipal = async ({filters}) => {
    try{
        return await models.principal_tbl.findAll({
            where:{
                ...filters
            }
        })
        .then(result => JSON.parse(JSON.stringify(result)))
    }
    catch(e){
        throw e
    }
}

const bulkCreatePrincipal = async({data,options})=>{
    try{
        return await models.principal_tbl.bulkCreate(data,{
            ...options
        })
    }
    catch(e){
        throw e
    }
}

module.exports = {
    getPrincipal,
    getAllPrincipal,
    getPaginatedPrincipal,
    bulkCreatePrincipal
}