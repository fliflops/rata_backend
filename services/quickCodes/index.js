const dataLayer = require('./quickCodesDatalayer')

exports.getAllQuickCode = async ({type}) => {
    try{
        return await dataLayer.getAllQuickCode({type})
    }
    catch(e){
        throw e
    }
}