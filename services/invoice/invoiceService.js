const dataLayer = require('./invoiceDataLayer');
const draftBill = require('../draftBill');
const _ = require('lodash');

exports.createInvoiceTransaction = async({
    invoices,
    details
}) => {
    try{
        
        let inv_details = details;

        for(const i in inv_details){
            const invoice = details[i]

            const fk_invoice_id = _.find(invoices,item => {
                return item.trip_no === invoice.trip_no && item.br_no === invoice.br_no
            }).id

            if(fk_invoice_id){
                inv_details[i]={
                    ...invoice,
                    fk_invoice_id
                }
            }
        }

        await dataLayer.createInvoiceTransaction({
            invoices:invoices,
            details:inv_details
        })

        return {
            invoices,
            inv_details
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
