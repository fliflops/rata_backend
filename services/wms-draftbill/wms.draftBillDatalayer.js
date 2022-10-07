const models = require('../../models');
const wmsDataLayer = require('../wms/wmsDatalayer');
const wmsRevLeakDataLayer = require('../wms-revenueLeak/wms.revenueLeakDatalayer');
const {viewFilters} = require('../../helper');

const {sequelize,Sequelize} = models;


const bulkCreateDraftbill = async({data,options}) => {
    try{
        return await models.wms_draft_bill_hdr_tbl.bulkCreate(data,{
            ...options,
            include:[
                {
                    model:models.wms_draft_bill_dtl_tbl,
                    as:'draft_bill_details'
                }
            ]
        })
    }
    catch(e){
        throw e
    }
}

const getAllDraftBills = async({filters}) => {
    try{
        return await models.wms_draft_bill_hdr_tbl.findAll({
            include:[
                {
                    model:models.wms_draft_bill_dtl_tbl,
                    as:'draft_bill_details'
                },
                {
                    model:models.principal_tbl,
                    as:'principal_tbl'
                },
                {
                    model:models.location_tbl,
                    as:'location_tbl'
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

const getPaginatedDraftBillDetails = async({
    filters,
    page,
    totalPage,
    draft_bill_no,
    orderBy
}) => {
    try{

        let newFilter=viewFilters.globalSearchFilter({
            model:models.wms_draft_bill_dtl_tbl.rawAttributes,
            filters:{
                ...filters
            }
        });
        
        return await models.wms_draft_bill_dtl_tbl.findAndCountAll({
            where:{
                ...newFilter,
                draft_bill_no
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

const getPaginatedDraftBills = async({
    filters,
    page,
    totalPage,
    orderBy
}) => {
    try{
        let newFilter=viewFilters.globalSearchFilter({
            model:models.wms_draft_bill_hdr_tbl.rawAttributes,
            filters:{
                ...filters
            }
        });

        return await models.wms_draft_bill_hdr_tbl.findAndCountAll({
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

const createDraftBillTransaction = async({
    draftBill,
    wms_data,
    rev_leak
}) => {
    try{
        return await sequelize.transaction(async t => {
            await bulkCreateDraftbill({
                data:draftBill,
                options:{
                    transaction:t
                }
            })

            await wmsRevLeakDataLayer.bulkCreateRevLeak({
                data:rev_leak,
                options:{
                    transaction:t
                }
            })

            await wmsDataLayer.updateWMSDateDetails({
                data:{
                    is_processed:1
                },
                filters:{
                    wms_reference_no:wms_data.map(item => item.wms_reference_no) 
                },
                options:{
                    transaction:t
                }
            })

        })

    }
    catch(e){
        throw e
    }
}


module.exports = {
    bulkCreateDraftbill,
    getAllDraftBills,
    getPaginatedDraftBills,
    getPaginatedDraftBillDetails,
    createDraftBillTransaction
}
