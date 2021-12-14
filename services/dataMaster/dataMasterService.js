const dataLayer = require('./dataMasterDataLayer');

exports.getServiceTypes = async() => {
    try{
        return await dataLayer.getServiceTypes()
    }
    catch(e){   
        throw e
    }
}