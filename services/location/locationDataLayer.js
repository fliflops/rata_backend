const models = require('../../models');
const {sequelize,Sequelize} = models;
const {useFormatFilters,viewFilters} = require('../../helper')


const getPaginatedLocation = async({
    filters,
    orderBy,
    page,
    totalPage
})=>{
    try{    
        let where = viewFilters.globalSearchFilter({
            model:models.location_tbl.rawAttributes,
            filters
        })

        return await models.location_tbl.findAndCountAll({
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

const getAllLocation = async ({filters}) => {
    try{
        return await models.location_tbl.findAll({
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

const bulkCreateLocation = async({data,options})=>{
    try{
        return await models.location_tbl.bulkCreate(data,{
            ...options
        })
    }
    catch(e){
        throw e
    }
}

module.exports = {
    getAllLocation,
    bulkCreateLocation,
    getPaginatedLocation
}