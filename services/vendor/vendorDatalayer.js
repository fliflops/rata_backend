const models = require('../../models');
const moment = require('moment');

const bulkCreateVendor = async({data,options})=>{
    try{
        return await models.vendor_tbl.bulkCreate(data,{
            ...options
        })
    }
    catch(e){
        throw e
    }
}

module.exports = {
    bulkCreateVendor
}