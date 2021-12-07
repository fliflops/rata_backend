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

exports.getAllVendorGroup = async({filters})=>{
    try{
        return await dataLayer.getAllVendorGroup({
            filters
        })
    }   
    catch(e){
        throw e
    }
}

exports.bulkCreateTransaction = async({
    vendor,
    vendorGroup,
    vendorGroupDetails
})=>{
    try {
        return await dataLayer.bulkCreateTransaction({
            vendor,
            vendorGroup,
            vendorGroupDetails
        })
        
    } catch (e) {
        throw e
    }
}
