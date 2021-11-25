const dataLayer = require('./locationDataLayer');

exports.getAllLocation = async() => {
    try{
        return await dataLayer.getAllLocation();
    }
    catch(e){
        throw e
    }
}