const dataLayer = require('./aggregationDatalayer');

exports.createAggRules = async({
    header,
    conditions
}) => {
    try{
        return await dataLayer.createAgg({
            header,
            conditions
        })
    }
    catch(e){
        throw e
    }
}

exports.getAllAggregation = async({filters}) => {
    try{
        return dataLayer.getAllAggregation({
            filters
        })
    }
    catch(e){
        throw e
    }
}

exports.getPaginatedAgg = async({
    filters,
    page,
    totalPage
})=>{
    try{
        return dataLayer.getPaginatedAgg({
            filters,
            page,
            totalPage
        })
    }
    catch(e){
        throw e
    }
}

exports.getAllAggCondition = async({filters})=>{
    try{
        return await dataLayer.getAllAggCondition({filters})
    }
    catch(e){
        throw e
    }
}