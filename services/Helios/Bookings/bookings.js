const dataLayer = require('./bookingsDatalayer');

exports.getInvoices = async({
    rdd,
    location
}) => {
    try{
        const invoices= await dataLayer.getInvoices({
            rdd:        typeof rdd      === 'undefined' ?''     : rdd,
            location:   typeof location === 'undefined' ? ''    : location
        })

        return invoices.map(item => {
            const invoice = String(item.invoice_no).split('|')
            return {
                ...item,
                is_billable: item.reason_code === null ? true : item.is_billable,
                invoice_no: invoice[0],
                redel_remarks: typeof invoice[1] === 'undefined' ? null : invoice[1]
            }
        })
    }
    catch(e){
        throw e
    }
}

exports.getInvoicesDtl = async({
    rdd,
    location
}) => {
    try{
        return await dataLayer.getInvoicesDtl({
            rdd:        typeof rdd      === 'undefined' ?   '' : rdd,
            location:   typeof location === 'undefined' ?   '' : location
        })
    }
    catch(e){
        throw e
    }
}

exports.getBookingRequest = async ({
    rdd
}) => {
    try{

        const header =  await dataLayer.getBookingRequest({
            rdd
        })

        const details = await dataLayer.getBookingRequestDetails({
            rdd
        })

        return {
            header: header.map(item => {
                const invoice = String(item.invoice_no).split('|')
                return {
                    ...item,
                    is_billable: item.reason_code === null ? true : item.is_billable,
                    invoice_no: invoice[0],
                    redel_remarks: typeof invoice[1] === 'undefined' ? null : invoice[1]
                }
            }),
            details: details.map(value => ({
                ...value,
                actual_qty: value.delivery_status === 'UNDELIVERED' ? value.planned_qty : value.actual_qty, 
                actual_weight: value.delivery_status === 'UNDELIVERED' ? value.planned_weight : value.actual_weight,
                actual_cbm: value.delivery_status === 'UNDELIVERED' ? value.planned_cbm : value.actual_cbm
            }))
        }
        
    }
    catch(e){
        throw e
    }
}
