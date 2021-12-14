const dataLayer = require('./invoiceDataLayer');

exports.createInvoiceTransaction = async({
    invoices,
    details
}) => {
    try{
        let inv_details = details;

        for(const i in details){
            const item = details[i]
            const invoice_id = invoices.filter(invoice => (
                invoice.trip_no === item.trip_no &&
                invoice.br_no === item.br_no
            )).map(item => item.id)

            inv_details[i] = {
                ...item,
                fk_invoice_id: invoice_id[0]
            }

        }

        // console.log(invoices.filter(item => {
        //     return !inv_details.map(i => i.fk_invoice_id).includes(item.id)
        // }))

        // return {
        //     invoices,
        //     inv_details
        // }

        return await dataLayer.createInvoiceTransaction({
            invoices,
            details:inv_details
        })
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