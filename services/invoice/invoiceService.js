const dataLayer = require('./invoiceDataLayer');
const revenueLeak = require('.')
const _ = require('lodash');
const { invoice } = require('..');

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

    //    const inv = await dataLayer.getAllInvoice({
    //        filters:{
    //            rdd:'2022-02-01'
    //        }
    //    })

    // //    console.log(inv.length)
    // //    console.log(invoices.length)


    //    const inv_inserted = inv.map(item => {
    //        return {
    //            ...item,
    //            key: `${item.trip_no}-${item.br_no}`
    //        }
    //    })

    //    const inv_raw = invoices.map(item => {
    //        return {
    //            ...item,
    //            key:`${item.trip_no}-${item.br_no}`
    //        }
    //    })

    //    console.log(inv_raw)
       





        // for(const i in details){
        //     const item = details[i]
        //     const invoice_id = invoices.filter(invoice => (
        //         invoice.trip_no === item.trip_no && invoice.br_no === item.br_no
        //     )).map(item => item.id)

        //     //if(invoice_id.length === 1){
        //         inv_details[i] = {
        //         ...item,
        //         fk_invoice_id: invoice_id[0]
        //         }
        //     // }
        //     // else{
        //     //     console.log(invoice_id)
        //     // }

        //     // console.log(invoice_id)

        //     // if(invoice_id.length === 0){
        //     //     console.log(invoice_id)
        //     // }
        // }


        // console.log(inv))

       
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

exports.updateInvoice = async({filters,data}) => {
    try{
        return await dataLayer.updateInvoice({
            data,
            filters,
            options:{}
        })
    }
    catch(e){
        throw e
    }
}

exports.createRevenueLeak = async({data}) => {
    try{
        return await dataLayer.createRevenueLeak({
            data,
            options:{
                updateOnDuplicate:['updatedAt','updated_by','reason','is_draft_bill']
            }
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