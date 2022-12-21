/**
 * Replan Draft Bill Steps
 * 1. Identify Billable and with complete ship point information invoices
 * 2. 
 * 
 */
 const getBillableInvoices = async({invoices}) => {
    try{
        let revenue_leak = [];
        const data = invoices.filter(item => item.is_billable === 1 && item.ship_point_from && item.ship_point_to)
        
        const notBillable = invoices.filter(item => item.is_billable === 0)
        .map(item => {
            const {ship_point_from,ship_point_to,...header} = item;
            
            return {
                ...header,
                revenue_leak_reason: 'NOT BILLABLE'
            }
        })

        revenue_leak = revenue_leak.concat(notBillable)

        const noShipPoint = invoices.filter(item => !(item.ship_point_to && item.ship_point_from)).map(item => {
            const {ship_point_from,ship_point_to,...header} = item;
            return {
                ...header,
                revenue_leak_reason: 'NO SHIP POINT INFORMATION'
            }
        })

        revenue_leak = revenue_leak.concat(noShipPoint)

        return {
            data,
            revenue_leak
        }
    }
    catch(e){
        throw e
    }
}

exports.buy = async({
    invoices,
    rdd
}) => {
    try{
        let data;
        let revenue_leak = [];
        let draft_bill = [];

        const contracts = await getContracts({
            rdd,
            where:{
                contract_type:'BUY',
                vendor_group: _.uniq(invoices.map(item => item.vg_code))
            }
        })

        data = await getBillableInvoices({invoices:data});
        revenue_leak = revenue_leak.concat(data.revenue_leak);

        return {
            data,
            revenue_leak
        }

    }
    catch(e){
        throw e
    }

}

exports.sell = async({}) => {

}