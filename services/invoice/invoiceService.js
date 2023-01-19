const dataLayer = require('./invoiceDataLayer');
const draftBill = require('../draftBill');
const _ = require('lodash');
const { Op } = require('sequelize');

exports.createInvoiceTransaction = async({
    invoices,
    details
}) => {
    try{
        
        let newDetails = [];

        invoices.map(header =>{
            const dtl = details.filter(item => item.trip_no === header.trip_no && item.br_no === header.br_no)
            .map(item => {
                return {
                    ...item,
                    fk_invoice_id: header.id
                }
            })

            newDetails = newDetails.concat(dtl)
        })

        await dataLayer.createInvoiceTransaction({
            invoices:invoices,
            details:newDetails
        })

        return {
            invoices,
            newDetails
        }  
    }
    catch(e){
        throw e
    }
}

exports.getLatestInvoice = async() => {
    try{
        return await dataLayer.getLatestInvoice()
    }
    catch(e){
        throw e
    }
}

exports.getAllInvoice = async({filters}) => {
    try{
        
        return await dataLayer.getAllInvoice({
            filters
        })
        .then(result => JSON.parse(JSON.stringify(result)))
    }
    catch(e)
    {
        throw e
    }
}

exports.updateInvoice = async({filters,data,options}) => {
    try{
        return await dataLayer.updateInvoice({
            data,
            filters,
            options
        })
    }
    catch(e){
        throw e
    }
}

exports.createRevenueLeak = async({data,options}) => {
    try{
        return await dataLayer.createRevenueLeak({
            data,
            options:{
                ...options,
                updateOnDuplicate:['updatedAt','updated_by','reason','is_draft_bill']
            }
        })
    }
    catch(e){
        throw e
    }
}

exports.updateRevenueLeak = async({filters,data,options})=>{
    try{
        return await dataLayer.updateRevenueLeak({
            filters,
            data,
            options 
        })
    }
    catch(e){
        throw e
    }
}

exports.getPaginatedRevenueLeak = async({
    filters
})=>{
    try{
        let {orderBy,page,totalPage,...newFilters} = filters
    
        return  await dataLayer.getPaginatedRevenueLeak({
            orderBy:orderBy.split(','),
            page,
            totalPage,
            filters:{
                ...newFilters
            }
        })
        .then(res => {
            let rows = null;
            let count = res.count;
            rows = res.rows.map(item => {
                const {invoice,...newItem} = item
                return {
                    ...newItem,
                    ...invoice,
                    is_draft_bill: item.is_draft_bill === 0 ? false : true
                }
            })

            return {
                rows,
                count
            }
        })
    }
    catch(e){
        throw e
    }
}

exports.getPaginatedInvoice = async({
    filters
})=>{
    try{
        let {orderBy,page,totalPage,...newFilters} = filters;

        return await dataLayer.getPaginatedInvoices({
            filters:newFilters,
            orderBy:orderBy.split(','),
            page,
            totalPage
        })

    }
    catch(e){
        throw e
    }
}

exports.getAllRevenueLeak = async({
    filters
})=>{
    try{
        
        return await dataLayer.getAllRevenueLeak({
            filters
        })
        .then(res => {
            return res.map(item => {
                const {invoice,...newItem} = item
                return {
                    ...newItem,
                    ...invoice,
                    is_draft_bill: item.is_draft_bill === 0 ? false : true
                }
            })
        })
    }
    catch(e){
        throw e
    }
}


exports.getRevenueLeakDetails = async({
    filters 
}) => {
    try{

        return await dataLayer.getInvoiceDetails({
            filters:{
                '$invoices_rev_leak.invoice_no$': {
                    [Op.not]:null
                },
                ...filters
            }
        })
        .then(result => {
            return result.map(item => {
                const {invoices_cleared,invoices_rev_leak,...leak} = item;

                return {
                    ...leak,
                    draft_bill_type:invoices_rev_leak?.draft_bill_type
                }
            })
        })

    }
    catch(e){
        throw e
    }
}