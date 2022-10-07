const dataLayer = require('./wms.revenueLeakDatalayer')

exports.getAllRevenueLeak = async({filters})=>{
    try{

        return await dataLayer.getAllRevnueLeak({filters})
        .then(result => {
            return result.map(header => {
                return {
                    ...header,
                    details: header.details.map(item => {
                        return {
                            ...item,
                            actual_cbm: isNaN(Number(item.actual_cbm)) ? 0 : Number(item.actual_cbm),
                            actual_qty: isNaN(Number(item.actual_qty)) ? 0 : Number(item.actual_qty)
                        }
                    })
                }
            })
        })
    }
    catch(e){
        throw e
    }
}

exports.getPaginatedRevLeak = async({
    filters
}) => {
    try{
        let {orderBy,order,page,totalPage,...newFilters} = filters;

        if(!orderBy){
            orderBy=[]
        }
        else{
            orderBy=[orderBy]
        }

        return await dataLayer.getPaginatedRevLeak({
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

exports.getPaginatedRevLeakDetails = async({
    filters
})=>{
    try{
        let {orderBy,order,page,totalPage,wms_reference_no,...newFilters} = filters;

        if(!orderBy){
            orderBy=[]
        }
        else{
            orderBy=[orderBy]
        }

        return await dataLayer.getPaginatedRevLeakDetails({
            filters:newFilters,
            wms_reference_no,
            page,
            totalPage,
            orderBy
        })

    }
    catch(e){
        throw e
    }
}

exports.createDraftBillRevleakTransaction = async({
    draftBill,
    revLeak,
    wms_reference_no
}) => {
    try{
        return await dataLayer.createDraftBillRevleakTransaction({
            draftBill:draftBill,
            rev_leak:revLeak,
            wms_reference_no
        })
    }
    catch(e){
        throw e
    }

}