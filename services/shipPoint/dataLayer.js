const models = require('../../models');
const {sequelize,Sequelize} = models;
const {useFormatFilters,viewFilters} = require('../../helper')


const getShipPoint = async({
    page,
    totalPage,
    search
}) => {
    try{
        return await sequelize.query(`sp_get_ship_point :search,:page,:totalPage`,{
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

const bulkCreateShipPoint = async({
    data,
    options
})=>{
    try{
        return await models.ship_point_tbl.bulkCreate(data,{
            ...options
        })
    } 
    catch (e) {
        throw e
    }
}

const getAllShipPoint = async({filters})=>{
    try{
        return await models.ship_point_tbl.findAll({
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

const getPaginatedShipPoint=async({filters,
    orderBy,
    page,
    totalPage})=>{
    try{
        let where = viewFilters.globalSearchFilter({
            model:models.ship_point_tbl.rawAttributes,
            filters
        })

        return await models.ship_point_tbl.findAndCountAll({
            where:{
                ...where
            },
            offset:parseInt(page) * parseInt(totalPage),
            limit:parseInt(totalPage),
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

module.exports={
    getShipPoint,
    bulkCreateShipPoint,
    getAllShipPoint,
    getPaginatedShipPoint
}