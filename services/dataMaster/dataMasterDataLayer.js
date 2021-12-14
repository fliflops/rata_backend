const models = require('../../models');

const getServiceTypes = async()=> {
    try{
        return await models.service_type_tbl.findAll()
    }
    catch(e){
        throw e
    }
}

module.exports = {
    getServiceTypes
}