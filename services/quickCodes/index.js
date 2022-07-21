const dataLayer = require('./quickCodesDatalayer');


exports.getAllQuickCode = async ({type}) => {
    try{
        return await dataLayer.getAllQuickCode({type})
    }
    catch(e){
        throw e
    }
}

exports.getAllQuickCodes = async({filters}) => {
    try{
        return await dataLayer.getAllQuickCodes({filters})
    }
    catch(e){
        throw e
    }
}

exports.getPaginatedQuickCode = async({filters})=>{
    try{
        let {orderBy,page,totalPage,...newFilters} = filters

        return await dataLayer.getPaginatedQuickCode({
            orderBy:[],
            page,
            totalPage,
            filters:newFilters
        })

    }
    catch(e){
        throw e
    }
}