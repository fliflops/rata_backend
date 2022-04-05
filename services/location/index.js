const dataLayer = require('./locationDataLayer');

exports.getAllLocation = async({filters}) => {
    try{
        return await dataLayer.getAllLocation({filters});
    }
    catch(e){
        throw e
    }
}

exports.bulkCreateLocation = async({data,options}) => {
    try{
        return await dataLayer.bulkCreateLocation({data,options})
    }
    catch(e){
        throw e
    }
}