const models = require('../../models');
const wmsDraftBillService = require('../wms-draftbill/wms.draftbillService')
const {viewFilters} = require('../../helper');

const {sequelize,Sequelize} = models;




const bulkCreateRevLeak = async({
    data,
    options
})=>{
    try{
        return await models.wms_rev_leak_tbl.bulkCreate(data,
            {
                ...options,
                include:[
                    {
                       model:models.wms_rev_leak_dtl_tbl,
                       as:'details'
                    }
                ],
                
            })
    }
    catch(e){
        throw e
    }
}

const bulkCreateRevleakHdr = async({
    data,
    options
})=>{
    try{
        return await models.wms_rev_leak_tbl.bulkCreate(data,
        {
            ...options, 
        })
    }
    catch(e){
        throw e
    }
}

const updateRevLeak = async({
    filters,
    options,
    data
})=>{
    try{

        return await models.wms_rev_leak_tbl.update({
            ...data
        },
        {
            where:{
                ...filters
            },
            ...options
        })

    }
    catch(e){
        throw e
    }
}

const getPaginatedRevLeak = async({
    filters,
    page,
    totalPage,
    orderBy
}) => {
    try{

        let newFilter=viewFilters.globalSearchFilter({
            model:models.wms_rev_leak_tbl.rawAttributes,
            filters:{
                ...filters
            }
        });

        return await models.wms_rev_leak_tbl.findAndCountAll({
            where:{
                ...newFilter
            },
            offset:parseInt(page)*parseInt(totalPage),
            limit:parseInt(totalPage),
            order:orderBy
        })
        .then(result => {
            let {count,rows} = JSON.parse(JSON.stringify(result))
            return {
                count,
                rows
            }
        })

    }
    catch(e){
        throw e
    }
}

const getPaginatedRevLeakDetails = async({
    filters,
    page,
    totalPage,
    wms_reference_no,
    orderBy
}) => {
    try{

        let newFilter=viewFilters.globalSearchFilter({
            model:models.wms_rev_leak_tbl.rawAttributes,
            filters:{
                ...filters
            }
        });

        return await models.wms_rev_leak_dtl_tbl.findAndCountAll({
            where:{
                ...newFilter,
                wms_reference_no
            },
            offset:parseInt(page)*parseInt(totalPage),
            limit:parseInt(totalPage),
            order:orderBy
        })
        .then(result => {
            let {count,rows} = JSON.parse(JSON.stringify(result))
            return {
                count,
                rows
            }
        })

    }
    catch(e){
        throw e
    }
}

const getAllRevnueLeak = async({filters})=> {
    try{
        return await models.wms_rev_leak_tbl.findAll({
            include:[
                {
                    model:models.wms_rev_leak_dtl_tbl,
                    as:'details'
                }
            ],
            where:{
                ...filters
            }
        })
        .then(result => JSON.parse(JSON.stringify(result)))
    }
    catch(e){
        throw e
    }
}

const createDraftBillRevleakTransaction = async({
    draftBill,
    rev_leak,
    wms_reference_no
})=>{
    try{
        return await sequelize.transaction(async t => {
            await wmsDraftBillService.bulkCreateDraftbill({
                data:draftBill,
                options:{
                    transaction: t
                }
            })

            await bulkCreateRevleakHdr({
                data:rev_leak,
                options:{
                    transaction: t,
                    updateOnDuplicate: ['leak_reason','contract_id','tariff_id','updatedAt']
                }
            })

            await updateRevLeak({
                filters:{
                    wms_reference_no: wms_reference_no
                },
                options:{
                    transaction: t
                },
                data:{
                    is_draft_bill: 1
                }
            })
            
        })
    }
    catch(e){
        throw e
    }
}


module.exports = {
    bulkCreateRevLeak,
    getPaginatedRevLeak,
    getPaginatedRevLeakDetails,
    getAllRevnueLeak,
    createDraftBillRevleakTransaction
}