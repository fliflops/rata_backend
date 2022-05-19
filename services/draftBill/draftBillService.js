const _ = require('lodash');
const dataLayer = require('./draftBillDatalayer');
// const invoiceService = require('../invoice/invoiceService');
// const contratService = require('../contract/contractService');
// const tariffService = require('../tariff/tariffService');
// const vendorService = require('../vendor/vendorService');
// const aggService = require('../aggregation/aggregation');
const moment = require('moment');
const {Op} = require('sequelize')

const draftBillCount = async() => {
    try {
        const getCount = await dataLayer.rawGetDraftBillCount({
            createdAt:moment().format("YYYY-MM-DD")
        })
        return getCount
    } 
    catch (error) {
        throw error
    }
}

const generateDraftBillNo = async({count}) => {
    try {
        return `${moment().format('MMDDYY')}-${String(count).padStart(5,"00000")}`    
    } 
    catch (error) {
        throw error
    }
}

exports.getPaginatedDraftBill = async({
    filters,
})=>{
    try{
        // console.log(filters)
        let {orderBy,page,totalPage,...newFilters} = filters
        return await dataLayer.getPaginatedDraftBill({
            orderBy:orderBy.split(','),
            page,
            totalPage,
            filters:{
                ...newFilters
            }
        })
    }
    catch(e){
        throw e
    }
}

exports.getAllInvoices = async({
    filters 
}) => {
    try{
        return await dataLayer.getAllInvoices({
            filters
        })
    }
    catch(e){
        throw e
    }

}

exports.getAllDraftBills = async({
    filters
})=>{
    try{
        return await dataLayer.getAllDraftBills({
            filters
        })
    }
    catch(e){
        throw e
    }
}

exports.createDraftBill = async(draftBills) => {
    try{
        let count = await draftBillCount();
        //remove the invoices without computed total charges
        let data = draftBills.filter(item => item.total_charges)
        let invData = [];
            
        for(const i in data){
            let {invoices,...draftBill} = data[i]
            count = count+=1
            let draftBillNo = await generateDraftBillNo({
                count
            })

            data[i] = {
                ...draftBill,
                draft_bill_no:draftBillNo,
                draft_bill_date:moment().format('YYYY-MM-DD'),
                status:'DRAFT_BILL'
            }

            invData.push(...invoices.map(item => {
                return {
                    ...item,
                    draft_bill_no:draftBillNo
                }
            }))
        }



        return {data,invData}
    }
    catch(e){
        throw e
    }
}

exports.createDraftBillInvoice = async({data,options}) => {
    try{
        return await dataLayer.createDraftBillInvoice({
            data,
            options
        })
    }
    catch(e){
        throw e
    }
}

exports.createDraftBillHeader = async({data,options})=>{
    try{
        return await dataLayer.createDraftBillHeader({
            data,
            options
        })
    }
    catch(e){
        throw e
    }
}

exports.updateDraftBill = async({
    filters,
    data
})=>{
    try{
        return await dataLayer.updateDraftBill({
            filters,
            data,
            options:{
                
            }
        })
    }
    catch(e){
        throw e
    }

}
