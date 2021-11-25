const dataLayer = require('./bookingsDatalayer');

exports.getInvoices = async({
    dateFrom,
    dateTo
}) => {
    try{
        return await dataLayer.getInvoices({
            dateFrom: typeof dateFrom === 'undefined'?'' : dateFrom,
            dateTo:   typeof dateTo === 'undefined' ? ''   : dateTo
        })
    }
    catch(e){
        throw e
    }
}

exports.getInvoicesDtl = async({
    dateFrom,
    dateTo
}) => {
    try{
        return await dataLayer.getInvoicesDtl({
            dateFrom: typeof dateFrom === 'undefined'?'' : dateFrom,
            dateTo:   typeof dateTo === 'undefined' ? ''   : dateTo
        })
    }
    catch(e){
        throw e
    }
}