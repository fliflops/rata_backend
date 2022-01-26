const models = require('../../models');
const moment = require('moment');
const { sequelize } = require('../../models');

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

const bulkCreateVendorGroup = async({data,options})=>{
    try{
        return await models.vendor_group_tbl.bulkCreate(data,{
            ...options
        })
    }
    catch(e){
        throw e
    }
}

const bulkCreateVendorGroupDetails = async({data,options})=>{
    try{
        return await models.vendor_group_dtl_tbl.bulkCreate(data,{
            ...options
        })
    }
    catch(e){
        throw e
    }
}

const bulkCreateTransaction = async({
    vendor,
    vendorGroup,
    vendorGroupDetails
})=>{
    try {
        return await sequelize.transaction(async t => {
            await bulkCreateVendor({
                data:vendor,
                options:{
                    updateOnDuplicate:['updatedAt'],
                    transaction:t,
                    //logging:false
                }
            })

            await bulkCreateVendorGroup({
                data:vendorGroup,
                options:{
                    updateOnDuplicate:['updatedAt'],
                    transaction:t
                }
            })

            await bulkCreateVendorGroupDetails({
                data:vendorGroupDetails,
                options:{
                    transaction:t
                }
            })
        })

    } catch (e) {
        throw e
    }
}

const getAllVendorGroup = async({filters,options}) => {
    try {
        return await models.vendor_group_tbl.findAll({
            // include:[
            //     {

            //     }
            // ],
            where:{
                ...filters
            }
        })
    } 
    catch (e) {
        throw e
    }
}

module.exports = {
    bulkCreateVendor,
    getAllVendorGroup,
    bulkCreateTransaction
}



