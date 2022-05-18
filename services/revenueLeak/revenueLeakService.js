const _ = require('lodash')

const invoiceService        = require('../invoice')
const draftBillService      = require('../draftBill')
const contractTariffService = require('../contract')
const aggService            = require('../aggregation')
const dataLayer             = require('./revenueLeakDataLayer')
const sumByQty = ({data,uom,field}) => {
    return parseFloat(_.sumBy(data.filter(item => item.uom === uom),item =>parseFloat(item[field]))).toFixed(2)
}

const sumBy = ({data,field}) => {
    return _.sumBy(data,item => parseFloat(item[field])).toFixed(2)
}

const sumQtyHeader = ({data,field})=>{
    return parseFloat(_.sum(data.map(item => parseFloat(item[field])))).toFixed(2)
}

const getInvoices = async({
    rdd,
    location,
    contract_type,
    draft_bill_invoices
})=> {
    try{
        let data=[]
        let filters = {
            rdd,
            location
        }

        if(String(contract_type).toUpperCase() === 'SELL'){
            filters = {
                ...filters,
                is_processed_sell:false
            }
        }
        else{
            filters = {
                ...filters,
                is_processed_buy:false
            }
        }


        const pod_invoices = await invoiceService.getAllInvoice({
            filters
        })

        

        let invoices = _.differenceBy(pod_invoices.map(item => {
            return {
                ...item,
                fk_invoice_id:item.id
            }
        }),draft_bill_invoices,'fk_invoice_id')

        for(const i in invoices){
            const invoice = invoices[i]
            const class_of_store = _.uniq(invoice.details.map(item => item.class_of_store))
            
            if(String(contract_type) === 'SELL'){
                if(class_of_store.length > 1){
                    for(let i in class_of_store){
                        let item = class_of_store[i]

                        const itemDetails = invoice.details.filter(i => i.class_of_store === item)
                        data.push({
                            ...invoice,
                            invoice_no:`${invoice.invoice_no}-${parseInt(i)+1}`,
                            fk_invoice_id:invoice.id,
                            class_of_store:item,
                            details:itemDetails
                        })
                    
                    }
                }
                else{
                    const itemDetails = invoice.details.filter(i => i.class_of_store === class_of_store[0])
                    data.push({
                        ...invoice,
                        class_of_store:class_of_store[0],
                        fk_invoice_id:invoice.id,
                        details:itemDetails
                    })
                }
            }
            else{
                const itemDetails = invoice.details.filter(i => i.class_of_store === class_of_store[0])
                data.push({
                    ...invoice,
                    class_of_store:class_of_store[0],
                    fk_invoice_id:invoice.id,
                    details:itemDetails
                })
            }    
        }

        return data
    }
    catch(e){
        throw e
    }
}

const getRevenueLeakInvoices = async({rdd,location,contract_type,draft_bill_invoices}) => {
    try{
  
        let data = []

        const leak_invoices = await invoiceService.getAllRevenueLeak({
            filters:{
                '$invoice.location$':       location,
                '$invoice.rdd$':            rdd,
                draft_bill_type:            contract_type,
                is_draft_bill:              false
            }
        })

        let invoices = _.differenceBy(leak_invoices,draft_bill_invoices,'fk_invoice_id')

        for(const i in invoices){
            const invoice = invoices[i]
            const class_of_store = _.uniq(invoice.details.map(item => item.class_of_store))
                //if(String(contract_type).toUpperCase() === 'SELL'){
                if(class_of_store.length > 1){
                    for(let i in class_of_store){
                        let item = class_of_store[i]
                        const itemDetails = invoice.details.filter(i => i.class_of_store === item)
                        data.push({
                            ...invoice,
                            id:invoice.fk_invoice_id,
                            invoice_no:`${invoice.invoice_no}-${parseInt(i)+1}`,
                            //fk_invoice_id:invoice.id,
                            class_of_store:item,
                            details:itemDetails
                        })
                    }
                }
                else{
                    const itemDetails = invoice.details.filter(i => i.class_of_store === class_of_store[0])
                    data.push({
                        ...invoice,
                        id:invoice.fk_invoice_id,
                        class_of_store:class_of_store[0],
                        //fk_invoice_id:invoice.id,
                        details:itemDetails
                    })
                }
            // }
            // else{
            //     data.push({
            //         ...invoice,
            //         id:invoice.fk_invoice_id,
            //         class_of_store:class_of_store[0]
            //     })
            // }
        }

        return data

    }
    catch(e){
        throw e
    }
}

const contract_validation = ({
    data,
    contract_type
}) => {
    try{
        let revenue_leak = []

        const no_contract = (data) => {
            return _.differenceBy(data,revenue_leak,'fk_invoice_id').filter(item => {
                return !item.contract
            })
            .map(item => {
                return {
                    invoice_no:         item.invoice_no,
                    fk_invoice_id:      item.id,
                    draft_bill_type:    contract_type,
                    reason:             'NO CONTRACT'
                }
            })
        }

        const no_vendor_group = (data) => {
            return _.differenceBy(data,revenue_leak,'fk_invoice_id').filter(item =>{
                return !item.vendor_group
            })
            .map(item => {
                return {
                    invoice_no:         item.invoice_no,
                    fk_invoice_id:      item.id,
                    draft_bill_type:    contract_type,
                    reason:             'NO VENDOR GROUP'
                }
            })
        }

        if(String(contract_type).toUpperCase() === 'SELL'){
            const noContracts = no_contract(data)
            revenue_leak = revenue_leak.concat(noContracts)
        }
        else if(String(contract_type).toUpperCase() === 'BUY'){
            const noVendors = no_vendor_group(data)
            revenue_leak = revenue_leak.concat(noVendors)

            const noContracts = no_contract(data)
            revenue_leak = revenue_leak.concat(noContracts)
        }   

        return {
            revenue_leak,
            invoice:data.filter(item => !revenue_leak.map(item => item.fk_invoice_id).includes(item.id))
        }
    }
    catch(e){
        throw e
    }
}

const tariff_validation = async ({data,contract_type,rdd})=>{
    try{

        let revenue_leak = []
        let invoices = []

        const contractTariffs = await contractTariffService.getContractDetails({
            filters:{
                contract_id: _.uniq(data.map(item => item.contract.contract_id)),
                '$contract.contract_type$': contract_type
            }
        })
        .then(result => {
            return result.map(item => {
                const {tariff,contract,...contractDtl} = item
                
                return {
                    ...contractDtl,
                    ...tariff,
                    ...contract,
                    vendor_group:contract.vendor_group,
                    contract_type:contract.contract_type
                }
            })
        })

        for(let i in data){
            const invoice       = data[i];
            const tariffs       = contractTariffs
            .filter(contract    => contract.contract_id === invoice.contract.contract_id)
            .filter(contract    => {

                const {
                    service_type,
                    from_geo_type,
                    from_geo,
                    to_geo_type,
                    to_geo,
                    location,
                    vehicle_type,    
                    class_of_store,
                    sub_service_type,
                } = contract

                const inv_stc_from              = invoice.ship_point_from[String(from_geo_type).toLowerCase()]
                const inv_stc_to                = invoice.ship_point_to[String(to_geo_type).toLowerCase()]
                const invoice_sub_service_type  = String(invoice.sub_service_type).toLowerCase()
                
                if(
                String(location).toLowerCase()              === String(invoice.location).toLowerCase()      &&
                (String(inv_stc_from).toLowerCase()         === String(from_geo).toLowerCase()              &&
                String(inv_stc_to).toLowerCase()            === String(to_geo).toLowerCase())               &&
                service_type                                === invoice.service_type                        &&
                (invoice_sub_service_type === null?true:(invoice_sub_service_type === String(sub_service_type).toLowerCase()))
                
                ){
                    //if tariff has vehicle type 
                    if(vehicle_type){
                        //if tariff is equal to invoice vehicle type
                        if(vehicle_type === invoice.vehicle_type){
    
                            //if tariff class off store is null 
                            if(!class_of_store){
                                return true
                            }
                            else{
                                //if tariff class of store is not null
                                //check if the invoice class of store is equal to the tariff class_of_store
                                if(String(class_of_store).toLowerCase() === String(invoice.class_of_store).toLowerCase()){
                                    return true
                                }
    
                                return false
                            }
                        } 
                        return false
                    }
                    else{
                        //check if the invoice class of store is equal to the tariff
                        if(String(class_of_store).toLowerCase() === String(invoice.class_of_store).toLowerCase()){
                           
                            return true
                        }
                        return false
                    }   
                }

                //return false if the primary conditions are not meant
                return false
            })

            if(!invoice.ship_point_from || !invoice.ship_point_to){
                revenue_leak.push({
                    invoice_no:         invoice.invoice_no,
                    fk_invoice_id:      invoice.id,
                    draft_bill_type:    contract_type,
                    reason:             'NO SHIP POINT INFORMATION'
                })
            }
            else if(tariffs.length > 1){
                // console.log(tariffs)
                revenue_leak.push({
                    invoice_no:         invoice.invoice_no,
                    fk_invoice_id:      invoice.id,
                    draft_bill_type:    contract_type,
                    reason:             'DUPLICATE TARIFF'
                })
            }
            else if(tariffs.length === 0){
                
                revenue_leak.push({
                    invoice_no:         invoice.invoice_no,
                    fk_invoice_id:      invoice.id,
                    draft_bill_type:    contract_type,
                    reason:             'NO TARIFF'
                })

                // console.log(invoice)
            }
            else {
                const tariff = {
                    tariff_id:          tariffs[0].tariff_id,
                    tariff_type:        tariffs[0].tariff_type,
                    min_billable_unit:  tariffs[0].min_billable_unit,
                    min_value:          tariffs[0].min_value,
                    max_value:          tariffs[0].max_value,
                    tariff_rate:        tariffs[0].tariff_rate,
                    group_by:           tariffs[0].group_by,
                    parameter:          tariffs[0].parameter,
                    with_agg:           tariffs[0].with_agg,
                    fk_agg_id:          tariffs[0].fk_agg_id,
                    from_geo_type:      tariffs[0].from_geo_type,
                    to_geo_type:        tariffs[0].to_geo_type,
                    contract_type:      tariffs[0].contract_type,
                    agg_rule:           tariffs[0].agg_rule
                }
                if(!tariff.agg_rule){
                    revenue_leak.push({
                        invoice_no:         invoice.invoice_no,
                        fk_invoice_id:      invoice.id,
                        draft_bill_type:    contract_type,
                        reason:             'NO MAPPED ALGORITHM'
                    })
                    continue;
                }

                invoices.push({
                    ...invoice,
                    tariff,
                    group_id: tariff.group_by === 'string' ?  tariff.group_by.split(',').map(item =>  invoice[item]).join('|') : null,
                
                })       
            }

        }

        return {
            revenue_leak,
            invoices
        }
    }
    catch(e){
        throw e
    }
}

const with_agg_result_validation = async({data,contract_type})=>{
    try{
        let revenue_leak = [];
        let grouped = [];
        const conditions = await aggService.getAllAggCondition({
            filters:{
                agg_id:_.uniq(data.map(item => item.tariff.fk_agg_id))
            }
        })

        //Validate if the condition is valid
        for(const invoice of data){
            const algo = _.find(conditions,(item)=> item.agg_id === invoice.tariff.fk_agg_id)
            // console.log(algo)
            if(!algo.raw_condition){
                revenue_leak.push({
                    invoice_no:         invoice.invoice_no,
                    fk_invoice_id:      invoice.id,
                    draft_bill_type:    contract_type,
                    reason:             'ALGORITHM HAS NO CONDITIONS'
                })
            }
        }

        //computation validation
        const groupedInvoices = _.groupBy(
            data.filter(item => !revenue_leak.map(item => item.id).includes(item.fk_invoice_id)),(item)=>{
                return item.group_id
            }
        )

        for(const i in groupedInvoices){
            const invoice = groupedInvoices[i][0]
            const parameters = invoice.tariff.parameter ?  invoice.tariff.parameter.split(',') : null
           
            const invoices = groupedInvoices[i].map(item => {
                const planned_qty    =sumByQty({data:item.details, uom:item.tariff.min_billable_unit, field:'planned_qty'})
                const actual_qty     =sumByQty({data:item.details, uom:item.tariff.min_billable_unit, field:'actual_qty'})
                const planned_weight =sumBy({data:item.details,field:'planned_weight'})
                const planned_cbm    =sumBy({data:item.details,field:'planned_cbm'})
                const actual_weight  =sumBy({data:item.details,field:'actual_weight'})
                const actual_cbm     =sumBy({data:item.details,field:'actual_cbm'})
                const return_qty     =sumBy({data:item.details,field:'return_qty'})
                const uom            =item.tariff.min_billable_unit

                return {
                    id:item.fk_invoice_id,
                    invoice_no:  item.invoice_no,
                    planned_qty,   
                    actual_qty,  
                    planned_weight,
                    planned_cbm,
                    actual_weight,
                    actual_cbm,
                    return_qty,
                    uom,
                }
            })

            grouped.push({
                invoices,
                parameters,
                conditions,
                tariff: invoice.tariff
            })
        }

        for(const item in grouped){
            const draftBill = grouped[item]

            //declare variable
            let aggregatedValues = {
                total_cbm:null,
                total_weight:null,
                total_qty:null
            }

            let total_charges = null;

            if(draftBill.parameters){
                draftBill.parameters.map(item => {
                    aggregatedValues = {
                        ...aggregatedValues,
                        total_cbm:      isNaN (sumBy({data:draftBill.invoices,field:'actual_cbm'})) ?                     0 :   sumBy({data:draftBill.invoices,field:'actual_cbm'}),
                        total_weight:   isNaN (sumBy({data:draftBill.invoices,field:'actual_weight'})) ?                  0 :   sumBy({data:draftBill.invoices,field:'actual_weight'}),
                        total_qty:      sumQtyHeader({data:draftBill.invoices,field:item})//100//isNaN (sumByQty({data:df.invoices,uom:df.min_billable_unit,field:item})) ? null :   sumByQty({data:df.invoices,uom:df.min_billable_unit,field:item})
                    }
                })
            }
            else{
                aggregatedValues={
                    ...aggregatedValues,
                    total_cbm:      isNaN (sumBy({data:draftBill.invoices,field:'actual_cbm'})) ? 0     : sumBy({data:draftBill.invoices,field:'actual_cbm'}),
                    total_weight:   isNaN (sumBy({data:draftBill.invoices,field:'actual_weight'})) ? 0  : sumBy({data:draftBill.invoices,field:'actual_weight'}),
                }
            }

            ///Compute total charges
            const {tariff} = draftBill
            const invoice = aggregatedValues

            let aggCondition = {
                condition:null,
                formula:null,
            }


            for(const cnd of draftBill.conditions){
                const conditon = cnd.raw_condition.split(',').join('')
                const fn = new Function(['tariff','invoice'],'return ' +conditon)
               
                if(fn(tariff,invoice) || fn(tariff,invoice) === null){
                    const formula = cnd.raw_formula.split(',').join('')
                    const fnFormula = new Function(['tariff','invoice'],'return '+formula)
                    total_charges = parseFloat(fnFormula(tariff,invoice)).toFixed(2)
                    aggCondition = {
                        ...aggCondition,
                        condition:conditon,
                        formula:formula
                    }
                    break; 
                }

            }

            //Add Invoices to Revenue Leak
            if(!aggCondition.condition){
                draftBill.invoices.map(item => {
                    revenue_leak.push({
                        invoice_no:         item.invoice_no,
                        fk_invoice_id:      item.id,
                        draft_bill_type:    contract_type,
                        reason:             'NO CONDITION MATCH'
                    })
                })
            }
        }

        return {
            revenue_leak,
        }
    }
    catch(e){
        throw e
    }
}

const without_agg_result_validation = async({data,contract_type})=>{
    try{
        let revenue_leak = [];
        let ungrouped = [];
        
        let aggCondition = {
            condition:null,
            formula:null,
        }

        const allConditions = await aggService.getAllAggCondition({
            filters:{
                agg_id:_.uniq(data.map(item => item.tariff.fk_agg_id))
            }
        })


        for (const i in data){
            let invoice = data[i]
            let total_charges = null

            let conditions = allConditions.filter(item => item.agg_id === invoice.tariff.fk_agg_id)
            
            let invoices = [
                {
                    planned_qty:        sumByQty({data:invoice.details,uom:invoice.tariff.min_billable_unit,field:'planned_qty'}),
                    actual_qty:         sumByQty({data:invoice.details,uom:invoice.tariff.min_billable_unit,field:'actual_qty'}),
                    planned_weight:     sumBy({data:invoice.details,field:'planned_weight'}),
                    planned_cbm:        sumBy({data:invoice.details,field:'planned_cbm'}),
                    actual_weight:      sumBy({data:invoice.details,field:'actual_weight'}),
                    actual_cbm:         sumBy({data:invoice.details,field:'actual_cbm'}),
                    return_qty:         sumBy({data:invoice.details,field:'return_qty'}),
                    fk_invoice_id:      invoice.fk_invoice_id
                }
            ]

            //console.log({invoice:invoice.invoice_no,conditions})

            for(const cnd of conditions){
                const conditon = cnd.raw_condition.split(',').join('')
                const fn = new Function(['tariff','invoice'],'return ' +conditon)
                // console.log(fn(invoice.tariff,invoice))
                if(fn(invoice.tariff,invoice)){
                    const formula = cnd.raw_formula.split(',').join('')
                    const fnFormula = new Function(['tariff','invoice'],'return '+formula)
                    total_charges = parseFloat(fnFormula(invoice.tariff,invoice)).toFixed(2)
                    aggCondition = {
                        ...aggCondition,
                        condition:conditon,
                        formula:formula
                    }
                }    
                break;
            }

            if(!aggCondition.condition){
                revenue_leak.push({
                    invoice_no:         invoice.invoice_no,
                    fk_invoice_id:      invoice.fk_invoice_id,
                    draft_bill_type:    contract_type,
                    reason:             'NO CONDITION MATCH'
                })
            }
        }

        return {
            revenue_leak
        }
    }   
    catch(e){
        throw e
    }
}

const invoice_validation = async({data,contract_type}) => {
    try{
       
        let revenue_leak=[]

        const notBillableValidation = (data) => {
            return data.filter(item => !item.is_billable).map(item => {
                 revenue_leak.push({
                    invoice_no:         item.invoice_no,
                    fk_invoice_id:      item.id,
                    draft_bill_type:    contract_type,
                    reason:             'NOT BILLABLE'
                })
            })
        }

        const noShipPointValidtion = (data) => {
            return data.filter(item => !item.ship_point_to || !item.ship_point_from).map(item => {
                revenue_leak.push({
                    invoice_no:         item.invoice_no,
                    fk_invoice_id:      item.id,
                    draft_bill_type:    contract_type,
                    reason:             'NO SHIP POINT INFORMATION' 
                })
            })
        }
       
        if(String(contract_type).toUpperCase() === 'SELL'){
            /*  1. not billable invoices
                2. no ship point information
            */
            
            notBillableValidation(data)
            noShipPointValidtion(_.differenceBy(data,revenue_leak,'fk_invoice_id'))
            
        }
       
        else if(String(contract_type).toUpperCase() === 'BUY'){
            /*  
                1. no ship point information
            */
            noShipPointValidtion(data)
        }
        
        // console.log(revenue_leak)

        return {
           invoices:data.filter(item => !revenue_leak.map(item => item.fk_invoice_id).includes(item.id)),
           revenue_leak
        }
    } 
    catch (e) {
        throw e
    }
}

exports.generateRevenueLeak = async({
    rdd,
    location,
    contract_type,
    draft_bill_invoices
}) => {
    try{
        let revenue_leaks = []

        let invoices = await getInvoices({rdd,location,contract_type, draft_bill_invoices})
        
        const invoicesValidation = await invoice_validation({data:invoices,contract_type})
        invoices = invoicesValidation.invoices
        revenue_leaks = revenue_leaks.concat(invoicesValidation.revenue_leak)

        if(contract_type==='SELL'){
            const contractValidation = await contract_validation({data:invoices,contract_type})
            invoices        = contractValidation.invoice
            revenue_leaks   = revenue_leaks.concat(contractValidation.revenue_leak)
        }
        
        const tariffValidation  = await tariff_validation({data:invoices,contract_type})
        invoices        = tariffValidation.invoices
        revenue_leaks   = revenue_leaks.concat(tariffValidation.revenue_leak)

        const withAggValidation = await with_agg_result_validation({
            data:invoices.filter(item => item.tariff.with_agg),
            contract_type
        })

        const withoutAggValidation = await without_agg_result_validation({
            data:invoices.filter(item => !item.tariff.with_agg),
            contract_type
        })

        revenue_leaks = revenue_leaks.concat(withAggValidation.revenue_leak).concat(withoutAggValidation.revenue_leak)

        const count =  _.uniqBy((await getInvoices({rdd,location,contract_type,draft_bill_invoices})),'fk_invoice_id').length
        const revenue_leak_count =  _.uniqBy(revenue_leaks,'fk_invoice_id').length

        return {
            invoices: _.differenceBy(invoices,revenue_leaks,'fk_invoice_id'),
            revenue_leaks: _.uniqBy(revenue_leaks,'fk_invoice_id'),
            invoice_count:count,
            revenue_leak_count
        }
    }   
    catch(e){
        throw e
    }
}

exports.generateRevenueLeakReplan = async({rdd,location,contract_type,draft_bill_invoices})=>{
    try{
        let revenue_leaks = []
       
        let invoices = await getRevenueLeakInvoices({rdd,location,contract_type,draft_bill_invoices,})
        // console.log(invoices)
        const count = _.uniqBy(invoices,'fk_invoice_id').length

        const invoicesValidation    = await invoice_validation({data:invoices,contract_type})
        invoices                    = invoicesValidation.invoices
        revenue_leaks               = revenue_leaks.concat(invoicesValidation.revenue_leak)

        const contractValidation    = await contract_validation({data:invoices,contract_type})
        invoices                    = contractValidation.invoice
        revenue_leaks               = revenue_leaks.concat(contractValidation.revenue_leak)
        
        const tariffValidation      = await tariff_validation({data:invoices,contract_type})
        invoices                    = tariffValidation.invoices
        revenue_leaks               = revenue_leaks.concat(tariffValidation.revenue_leak)
        
        const withAggValidation = await with_agg_result_validation({
            data:invoices.filter(item => item.tariff.with_agg),
            contract_type
        })

        const withoutAggValidation = await without_agg_result_validation({
            data:invoices.filter(item => !item.tariff.with_agg),
            contract_type
        })

        revenue_leaks = revenue_leaks.concat(withAggValidation.revenue_leak).concat(withoutAggValidation.revenue_leak)

        const revenue_leak_count =  _.uniqBy(revenue_leaks,'fk_invoice_id').length

        return {
            invoices: _.differenceBy(invoices,revenue_leaks,'fk_invoice_id'),
            revenue_leaks: _.uniqBy(revenue_leaks,'fk_invoice_id'),
            invoice_count:count,
            revenue_leak_count
        }

    }
    catch(e){
        throw e
    }
}

exports.createRevenueLeakTransaction = async({header,details,revenueLeak,contract_type,oldRevenueLeak}) => {
    try{
        return await dataLayer.createRevenueLeakTransaction({
            header,
            details,
            revenueLeak,
            oldRevenueLeak,
            contract_type
        })
    }
    catch(e){
        throw e
    }
}
