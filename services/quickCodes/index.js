const dataLayer = require('./quickCodesDatalayer')

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