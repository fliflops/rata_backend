const dataLayer = require('./vendorDatalayer')

exports.bulkCreateVendor = async({data})=>{
    try {
        return await dataLayer.bulkCreateVendor({
            data,
            options:{
                updateOnDuplicate:['updatedAt']
            }
        })
    } 
    catch (e) {
        throw e
    }
}

