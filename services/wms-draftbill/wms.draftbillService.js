const Sequelize = require('sequelize');
const dataLayer = require('./wms.draftBillDatalayer');
const moment = require('moment');

const {Op} = Sequelize

exports.bulkCreateDraftbill = async({data,options}) => {
   try{
        return await dataLayer.bulkCreateDraftbill({
            data,
            options
        })
   }
   catch(e){
    throw e
   } 
}

const generateDraftBillNo = async(count) => {
    try{
        return `W${moment().format('MMDDYY')}${String(count).padStart(5,"00000")}`
    }
    catch(e){
        throw e
    }
}


exports.createDraftBill = async({
    data,
    job_id
})=>{
    try{
        const getDraftBills = await dataLayer.getAllDraftBills({
            filters:{
                [Op.and]:[
                    Sequelize.where(Sequelize.fn('date',Sequelize.col('wms_draft_bill_hdr_tbl.createdAt')),'=',moment().format('YYYY-MM-DD'))
                ]
            }
        })

        const wms_draft_bill = []
        let count = getDraftBills.length
        
        for(const draftBill of data){
            const {details,...header} = draftBill

            count = count+=1

            const draft_bill_no = await generateDraftBillNo(count)

            wms_draft_bill.push({
                ...header,
                draft_bill_no,
                job_id,
                draft_bill_details: details.map(item => {
                    return {
                        ...item,
                        draft_bill_no
                    }
                })
            })
        }

        return wms_draft_bill
    }
    catch(e){
        throw e
    }
}


exports.getPaginatedDraftBills = async({filters})=>{
    try{
        let {orderBy,order,page,totalPage,...newFilters} = filters;

        if(!orderBy){
            orderBy=[]
        }
        else{
            orderBy=[orderBy]
        }

        return await dataLayer.getPaginatedDraftBills({
            filters:newFilters,
            page,
            totalPage,
            orderBy
        })
    }
    catch(e){
        throw e
    }
}   

exports.getPaginatedDraftBillDetails = async({filters})=>{
    try{
        let {orderBy,order,page,totalPage,draft_bill_no,...newFilters} = filters;

        if(!orderBy){
            orderBy=[]
        }
        else{
            orderBy=[orderBy]
        }

        return await dataLayer.getPaginatedDraftBillDetails({
            filters:newFilters,
            page,
            totalPage,
            draft_bill_no,
            orderBy
        })
    }
    catch(e){
        throw e
    }
}

exports.getAllDraftBills = async({filters})=>{
    try{
        return await dataLayer.getAllDraftBills({
            filters
        })
        .then(result => {

            return result.map(item => {
                const {principal_tbl,location_tbl,...header} = item;

                return {
                    ...header,
                    ascii_principal_code:String(principal_tbl?.ascii_principal_code).trim() || null,
                    ascii_customer_code:String(principal_tbl?.ascii_customer_code).trim() || null,
                    ascii_loc_code:location_tbl?.ascii_loc_code || null
                }
            })            
        })
    }
    catch(e){
        throw e
    }
}

exports.createDraftBillTransaction = async({
    draftBill,
    wmsData,
    revLeak
})=>{
    try{
        return await dataLayer.createDraftBillTransaction({
            draftBill:draftBill,
            wms_data:wmsData,
            rev_leak:revLeak
        })
    }
    catch(e){
        throw e
    }
}


exports.getAllDraftBillDetails = async({
    filters
}) => {
    try{
        return await dataLayer.getAllDraftBillDetails({
            filters
        })
        
    }
    catch(e){
        throw e
    }
}

