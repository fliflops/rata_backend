
const models = require('../../models');
const { sequelize } = models;

const createAggHeader = async({data,options}) => {
    try{
        return await models.agg_tbl.create({
            ...data
        },{
            ...options
        })
    }
    catch(e){
        throw e
    }
}

const createAggConditions = async({data,options}) => {
    try{
        return await models.agg_conditions_tbl.bulkCreate(data,{
            ...options
        })
    }
    catch(e){
        throw e
    }
}

const createAgg = async ({
    header,
    conditions
}) => {
    try{
        return await sequelize.transaction(async t => {
            const createdHeader = await createAggHeader({
                data:header,
                options:{
                    transaction:t
                }
            })

            await createAggConditions({
                data:conditions.map(item => {
                    return{
                        ...item,
                        agg_id:createdHeader.id
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


const getAllAggregation = async({filters})=>{
    try{
        return await models.agg_tbl.findAll({
            include:[{
                model:models.agg_conditions_tbl,
                as:'conditions'
            }],
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

const getAllAggCondition = async({filters}) => {
    try{
        return await models.agg_conditions_tbl.findAll({
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

const getPaginatedAgg = async({
    filters,
    page,
    totalPage
})=>{
    try{
        const {count,rows} = await models.agg_tbl.findAndCountAll({
            where:{
                ...filters
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

        return {
            count,
            rows
        }
    }
    catch(e){
        throw e
    }
}

module.exports = {
    createAgg,
    createAggConditions,
    createAggHeader,
    getAllAggregation,
    getPaginatedAgg,
    getAllAggCondition
}
