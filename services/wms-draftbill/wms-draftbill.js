const _ = require('lodash')
const moment = require('moment');
const {Op} = require('sequelize');

const contractService = require('../contract');
const algorithmService = require('../aggregation');
const draftBillService = require('./wms.draftbillService');

//format data by class of store and order uom
const formatByClassOfStore = async ({wms_data}) => {
    try{
        const grouped_data = []

        for(const data of wms_data){
            const {details,...header} = data
            const raw_group = _.groupBy(details, item => item.class_of_store+item.uom);

            Object.keys(raw_group).map((uom,i) => {
                const _details = raw_group[uom]

                grouped_data.push({
                    ...header,
                    wms_reference_no: i > 0 ? `${header.wms_reference_no}-${i}` : header.wms_reference_no,
                    fk_wms_reference_no:header.wms_reference_no,
                    class_of_store: _details[0].class_of_store,
                    uom:_details[0].uom,
                    details:_details
                })
            })
        }        return grouped_data

    }
    catch(e){
        throw e
    }
}

//
const assignContract = async({
    transaction_date,
    wms_data
})=> {
    try{
        let data = []
        let revenue_leak=[]
        const revenue_leak_reason = 'NO CONTRACT'

        const contracts = await contractService.getAllWMSContracts({
            filters:{
                principal_code: _.uniqBy(wms_data.map(item => item.principal_code)),
                contract_status:'APPROVED',
                valid_from:{
                    [Op.lte]: transaction_date
                },
                valid_to:{
                    [Op.gte]: transaction_date
                }
            }
        })

        for(let contract of contracts){
            const filtered_data =  wms_data.filter(item => {
                return item.principal_code === contract.principal_code
            })
            .map(item => {
                return {
                    ...item,
                    contract_id:contract.contract_id,
                }
            })
            
            data = data.concat(filtered_data)
        }

        //get revenue leaks
        revenue_leak = wms_data.filter(x => {
           return !data.map(y => y.fk_wms_reference_no).includes(x.fk_wms_reference_no)
        })
        .map(item => {
            return {
                ...item,
                contract_id:null,
                leak_reason: revenue_leak_reason,
            }
        })

    
        return {
            data,
            revenue_leak
        }
    
    }
    catch(e){
        throw e
    }
}

//
const assignTariff = async({
    wms_data,
    transaction_date
})=>{
    try{
        let draft_bill = [];
        let revenue_leak = [];

        let tariff = null;

        // console.log(wms_data) 

        const contract_tariffs = await contractService.getAllWMSContractTariff({
            filters:{
                contract_id:_.uniqBy(wms_data.map(item => item.contract_id)),
                status:'ACTIVE',
                valid_from:{
                    [Op.lte]: transaction_date
                },
                valid_to:{
                    [Op.gte]: transaction_date
                }
            }
        });

        for(let data of wms_data){
            const tariffs = contract_tariffs
            .filter(contract => contract.contract_id === data.contract_id)
            .filter(contract => {
                const {
                    tariff:{
                        tariff_id,
                        service_type,
                        vehicle_type,
                        class_of_store,
                        min_billable_unit,
                        location
                    }
                } = contract

                const wmsLocation       = String(data.location).toLowerCase() 
                const wmsServiceType    = String(data.service_type).toLowerCase()
                const wmsVehType        = String(data.vehicle_type).toLowerCase()
                const wmsClass          = String(data.class_of_store).toLowerCase()
                const wmsUom            = String(data.uom).toLowerCase()

                if( String(location).toLowerCase()      === wmsLocation     &&
                    String(service_type).toLowerCase()  === wmsServiceType
                ){

                    //if tariff has mbu
                    if(min_billable_unit){
                        if(String(min_billable_unit).toLowerCase() === wmsUom){  
                            if(vehicle_type){
                                if(String(vehicle_type).toLowerCase() === wmsVehType){
                                    if(!class_of_store){
                                        return true
                                    }
                                    else {
                                        //if class of store is not null
                                        //check if the invoice class of store is equal to the tariff
                                        if(String(class_of_store).toLowerCase() === wmsClass){
                                            return true
                                        }
                                        //if invoice class of store is not equel to tariff
                                        return false
                                    }
                                }
                            }
                            else {
                                //check if the invoice class of store is equal to the tariff
                                if(String(class_of_store).toLowerCase() === wmsClass){
                                    return true
                                }

                                // if class_of_store and vehicle_type is null return true
                                if (!class_of_store && !vehicle_type) {
                                    return true
                                }
                            }
                        }
                    }
                    else {
                        if(vehicle_type){
                            if(String(vehicle_type).toLowerCase() === wmsVehType){
                                if(!class_of_store){
                                    return true
                                }
                                else {
                                    //if class of store is not null
                                    //check if the invoice class of store is equal to the tariff
                                    if(String(class_of_store).toLowerCase() === wmsClass){
                                        return true
                                    }
                                    //if invoice class of store is not equel to tariff
                                    return false
                                }
                            }
                            else {
                                //check if the invoice class of store is equal to the tariff
                                if(String(class_of_store).toLowerCase() === wmsClass){
                                    return true
                                }

                                return false
                            }
                        }
                        return false
                    }
                }

                //return false if the primary conditions are not meant
                return false
            });

            //has a valid tariff
            if(tariffs.length === 1){
                
                tariff={    
                    ...tariffs[0].tariff,
                    tariff_rate: tariffs[0].tariff_rate,
                    group_by:       tariffs[0].group_by,
                    parameter:      tariffs[0].parameter,
                    with_agg:       tariffs[0].with_agg,
                    fk_agg_id:      tariffs[0].fk_agg_id,
                    conditions:     tariffs[0].conditions
                }

                draft_bill.push({
                    ...data,
                    group_id: typeof tariff.group_by === 'string' ?  tariff.group_by.split(',').map(item =>  data[item]).join('|') : null,
                    tariff
                })
            }

            //has invalid tariffs
            if(tariffs.length > 1){
                revenue_leak.push({
                    ...data,
                    tariff_id: null,
                    leak_reason:'DUPLICATE TARIFFS'
                })
            }

            if(tariffs.length === 0){
                revenue_leak.push({
                    ...data,
                    tariff_id: null,
                    leak_reason:'NO TARIFF'
                })
            }
        }

        return {
            data:draft_bill,
            revenue_leak
        };
    } 
    catch (e) {
        throw e    
    }
}

const generateWithAggDraftBill = async({
    wms_data
}) => {
    try{

        const grouped = [];
        let revenue_leak = [];

        const raw_group = _.groupBy(wms_data,item => item.group_id);
        //return raw_group
        Object.keys(raw_group).map(item => {
            const header = raw_group[item][0]
            const conditions = header.tariff.conditions
            const tariff = header.tariff
            const parameters = header.tariff.parameter ? header.tariff.parameter.split(',') : null
            
            const wms_details = raw_group[item].map(item => {
                const details = item.details
                
                const actual_qty = _.sumBy(details,item => item.actual_qty ? item.actual_qty : 0).toFixed(2)
                const actual_cbm = _.sumBy(details,item => item.actual_cbm ? item.actual_cbm : 0).toFixed(2)
                const billing_qty = _.sumBy(details, item => item[header.tariff.parameter] ? item[header.tariff.parameter] : 0).toFixed(2)
                
                return {
                    draft_bill_no:      null,
                    transaction_date:   item.transaction_date,
                    location:           item.location,
                    primary_ref_doc:    item.primary_ref_doc,
                    vehicle_type:       item.vehicle_type,
                    tariff_id:          item.tariff.tariff_id,
                    contract_id:        item.contract_id,
                    service_type:       item.service_type,
                    min_billable_value: item.tariff.min_value,
                    max_billable_value: item.tariff.max_value,
                    min_billable_unit:  item.tariff.min_billable_unit,
                    class_of_store:     item.class_of_store,
                    actual_qty,
                    actual_cbm,
                    billing_qty,
                    wms_reference_no:   item.wms_reference_no,
                    fk_wms_reference_no: item.fk_wms_reference_no
                }
            })

            //computation 
            //1 Aggregate the quantities
            const aggregatedValues = {
                total_cbm:_.sumBy(wms_details, item => parseFloat(item.actual_cbm)),
                total_qty:_.sumBy(wms_details, item => parseFloat(item.actual_qty)),
                total_billing_qty: _.sumBy(wms_details, item =>parseFloat(item.billing_qty))
            }

            let aggCondition = {
                condition:null,
                formula:null,
            }

            let total_charges = null;

            for(const cnd of conditions){
                const conditon = cnd.raw_condition.split(',').join('')
                const fn = new Function(['tariff','invoice'],'return ' +conditon)

                if(fn(tariff||aggregatedValues) || fn(tariff||aggregatedValues) === null){
                    const formula = cnd.raw_formula.split(',').join('')
                    const fnFormula = new Function(['tariff','invoice'], 'return '+formula)
                    total_charges=parseFloat(fnFormula(tariff,aggregatedValues)).toFixed(2)
                    aggCondition = {
                        ...aggCondition,
                        condition:conditon,
                        formula:formula
                    }
                }
                
            }

            //Revenue Leak
            //Check if no condition match
            if(!aggCondition.condition){ 
                revenue_leak = revenue_leak.concat(raw_group[item].map(item=>{
                    return {
                        ...item,
                        leak_reason:'NO CONDITION MATCH'
                    }
                }))
            }   
            else if(!total_charges){
                revenue_leak = revenue_leak.concat(raw_group[item].map(item=>{
                    return {
                        ...item,
                        leak_reason:'NULL TOTAL CHARGES'
                    }
                }))
            }
            else 
            grouped.push({
                draft_bill_no:      null,
                service_type:       header.service_type,
                draft_bill_date:    moment().format('YYYY-MM-DD'),
                contract_id:        header.contract_id,
                tariff_id:          header.tariff.tariff_id,
                principal:          header.principal_code,
                vehicle_type:       header.vehicle_type,
                location:           header.location,
                transaction_date:   header.transaction_date,
                rate:               header.tariff.tariff_rate,
                min_billable_value: header.tariff.min_value,
                max_billable_value: header.tariff.max_value,
                min_billable_unit:  header.tariff.min_billable_unit,
                parameters:         header.tariff.parameter,
                status:'DRAFT_BILL',
                total_charges,
                ...aggCondition,
                ...aggregatedValues,
                details:            wms_details.map((item,index) => {
                    let billing =  ( item.billing_qty / aggregatedValues.total_billing_qty ) * total_charges

                    if (index === wms_details.length - 1) {
                        billing=Math.floor(total_charges/wms_details.length)  + (total_charges%wms_details.length)
                    }
                    else {
                        billing=Math.floor(total_charges/wms_details.length)
                    }

                    return {
                        ...item,
                        billing: billing.toFixed(2)
                    }
                })
            })
        })

        return {
            data:grouped,
            revenue_leak
        }
    }
    catch(e){
        throw e
    }
}

const formatRevenueLeak = async({data}) => {
    try{
        return data.map(item => {
            const {details,...newItem} = item
            return {
                wms_reference_no: newItem.wms_reference_no,
                fk_wms_reference_no: newItem.fk_wms_reference_no,
                principal_code: newItem.principal_code,
                location: newItem.location,
                service_type: newItem.service_type,
                transaction_date: newItem.transaction_date,
                job_id: newItem.job_id,
                contract_id: newItem.contract_id,
                uom: newItem.uom,
                tariff_id: newItem?.tariff_id || null,
                leak_reason: newItem.leak_reason,
                details: details.map(item => {
                    return {
                        ...item,
                        wms_reference_no: newItem.wms_reference_no,
                        fk_wms_reference_no: newItem.fk_wms_reference_no, 
                    }
                })
            }
        })
    }
    catch(e){
        throw e
    }
}

module.exports = async ({ 
    wms_data,
    transaction_date,
    job_id
}) => {
    try{
        let data;
        let revenue_leak = [];

        //1. format data by class of store
        const raw_data = await formatByClassOfStore({
            wms_data
        })

        //2. Assign Contract to Data and revenue leak
        data = await assignContract({
            wms_data:raw_data,
            transaction_date
        })

        revenue_leak = revenue_leak.concat(data.revenue_leak)

        //3. Assign Tariff 
        data = await assignTariff({
            wms_data:data.data,
            transaction_date
        })

        revenue_leak = revenue_leak.concat(data.revenue_leak)

        //4. Process the draft bill
        //with aggregation
        data = await generateWithAggDraftBill({
            wms_data:data.data.filter(item => item.tariff.with_agg)
        })

        revenue_leak = revenue_leak.concat(data.revenue_leak)

        //without agg
        //5. Create Draft Bill
        data = await draftBillService.createDraftBill({
            data:data.data,
            job_id
        })


        revenue_leak = await formatRevenueLeak({data:revenue_leak})

        //6. Update wms header table and insert draftbill to database
        
        await draftBillService.createDraftBillTransaction({
            draftBill:data,
            wmsData:wms_data,
            revLeak:revenue_leak
        })


        return {
            data,
            revenue_leak
        }
    }
    catch(e){
        throw e
    }

}