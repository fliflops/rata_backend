const _ = require('lodash')
const moment = require('moment');
const {Op} = require('sequelize');

const draftBillService = require('../draftBill')
const invoiceService = require('../invoice')
const contractService = require('../contract')
const aggService = require('../aggregation')
const vendorService = require('../vendor')
const dataLayer = require('./generateDraftBillDatalayer');

const sumByQty = ({data,uom,field}) => {
    return parseFloat(_.sumBy(data.filter(item => item.uom === uom),item =>parseFloat(item[field]))).toFixed(2)
}

const sumQtyHeader = ({data,field})=>{
    return parseFloat(_.sum(data.map(item => parseFloat(item[field])))).toFixed(2)
}

const sumBy = ({data,field}) => {
    return _.sumBy(data,item => parseFloat(item[field])).toFixed(2)
}

const getAggCondition = async(aggId)=>{
    try{
        return await aggService.getAllAggCondition({
            filters:{
                agg_id:aggId
            }
        })
    }
    catch(e){
        throw e
    }
}

const getAllInvoice = async ({filters}) => {
    try{
        let invoiceWithClassOfStore = []
        const invoices = await invoiceService.getAllInvoice({
            filters:{
                ...filters
            }
        })
        .then(async result => {
            return result.map(item => {
                let {contract,vendor_group,...newItem} = item
                const contract_id = typeof contract?.contract_id !== 'undefined' ? contract.contract_id : null
                const contract_type = typeof contract?.contract_type !== 'undefined' ? contract.contract_type : null
               
                return {
                    ...newItem,
                    contract_id,
                    contract_type
                }
            })            
        })

        for(const i in invoices) {
            const invoice =  invoices[i];
            const class_of_store = _.uniq(invoice.details.map(item => item.class_of_store))
            if(class_of_store.length > 1){
                for(let i in class_of_store){
                    let item = class_of_store[i]

                    //Replace the item details per class of store
                    const itemDetails = invoice.details.filter(i => i.class_of_store === item)
                    invoiceWithClassOfStore.push({
                        ...invoice,
                        invoice_no:`${invoice.invoice_no}-${parseInt(i)+1}`,
                        fk_invoice_id:invoice.id,
                        class_of_store:item,
                        details:itemDetails
                    })
                }
            }
            else{
                 //Replace the item details per class of store
                const itemDetails = invoice.details.filter(i => i.class_of_store === class_of_store[0])
                invoiceWithClassOfStore.push({
                    ...invoice,
                    class_of_store:class_of_store[0],
                    fk_invoice_id:invoice.id,
                    details:itemDetails
                })
            }
        } 
        
        // filter invoices with contracts,ship point, and billable
        return invoiceWithClassOfStore.filter(item => 
            item.contract_id   && 
            item.ship_point_to && 
            item.ship_point_from &&
            item.is_billable)
    }
    catch(e){
        throw e
    }
}

const getAllRevenueLeakInvoices = async({rdd,location,contract_type})=>{
    try{
        const invoices = await invoiceService.getAllRevenueLeak({
            filters:{
                '$invoice.location$':   location,
                '$invoice.rdd$':        rdd,
                // '$invoice.is_billable$':true,
                draft_bill_type:        contract_type,
                is_draft_bill:          false
            }
        })
        .then(result => JSON.parse(JSON.stringify(result)))
        
        if(String(contract_type).toUpperCase() === 'SELL'){
            let invoiceWithClassOfStore = []
            
            const data = invoices.map(item => {
                const {contract,...invoice} = item
                const contract_id   = typeof contract?.contract_id !== 'undefined' ? contract.contract_id : null
                const contract_type = typeof contract?.contract_type !== 'undefined' ? contract.contract_type : null
                
                return {
                    ...invoice,
                    contract_id,
                    contract_type
                }
            })
            .filter(item => item.contract_id   && 
                item.ship_point_to             && 
                item.ship_point_from           &&
                item.is_billable
            )

            for(const i in data) {
                const invoice =  data[i];
                const class_of_store = _.uniq(invoice.details.map(item => item.class_of_store))
                if(class_of_store.length > 1){
                    for(let i in class_of_store){
                        let item = class_of_store[i]
    
                        //Replace the item details per class of store
                        const itemDetails = invoice.details.filter(i => i.class_of_store === item)
                        invoiceWithClassOfStore.push({
                            ...invoice,
                            invoice_no:`${invoice.invoice_no}-${parseInt(i)+1}`,
                            class_of_store:item,
                            details:itemDetails
                        })
                    }
                }
                else{
                     //Replace the item details per class of store
                    const itemDetails = invoice.details.filter(i => i.class_of_store === class_of_store[0])
                    invoiceWithClassOfStore.push({
                        ...invoice,
                        class_of_store:class_of_store[0],
                        details:itemDetails
                    })
                }
            }
            
            return invoiceWithClassOfStore 
        }
        else{   
            
            const vendorGroups = await vendorService.getAllVendorGroupDtl({
                filters:{
                    '$vendor_header.vg_status$':'ACTIVE',
                    '$vendor_header.location$':location
                }
            })

            const data = invoices.map(item => {
                const {contract,vendor_group,...invoice} = item
                const vg_code = _.find(vendorGroups,['vg_vendor_id',invoice.trucker_id])
                
                return {
                    ...invoice,
                    contract_id:    null,
                    vg_code:        vg_code?.vg_code
                }
            
            })
            .filter(item => item.vg_code && item.ship_point_to && item.ship_point_from)

            return data
        }
    }
    catch(e){
        throw e
    }
}

const getBuyInvoice = async({filters}) => {
    try{

        const vendorGroups = await vendorService.getAllVendorGroupDtl({
            filters:{
                '$vendor_header.vg_status$':'ACTIVE',
                '$vendor_header.location$':filters.location
            }
        })

        let data = await invoiceService.getAllInvoice({
            filters:{...filters}
        })
        .then(async result => {

            return result.map(item => {
                let {contract,vendor_group,...newItem} = item
                const vg_code = _.find(vendorGroups,['vg_vendor_id',newItem.trucker_id])
            
                return {
                    ...newItem,
                    contract_id:null,
                    vg_code:vg_code?.vg_code,
                    fk_invoice_id:item.id
                }
            })
            
        })

        return data.filter(item => item.vg_code && item.ship_point_to && item.ship_point_from )
    }
    catch(e){
        throw e
    }
}


const getContracts = async({
    rdd,
    contract_type,
    data
}) => {
    try{

        let filters = {}

        if(String(contract_type).toUpperCase() === 'SELL'){
            const contractID= _.uniq(data.map(item => item.contract_id).filter(item => item !== null))
            filters={
                contract_id:contractID
            }
        }
        else if(String(contract_type).toUpperCase() === 'BUY'){
            const vendor_groups = _.uniq(data.map(item => item.vg_code))
            filters={
                '$contract.vendor_group$':vendor_groups
            }
        }

        let details = await contractService.getContractDetails({
            filters:{
                // contract_id:contractID,
                ...filters,
                '$contract.contract_type$':contract_type,
                '$contract.valid_from$':{
                    [Op.lte]: rdd
                    //moment().toDate()
                },
                '$contract.valid_to$':{
                    [Op.gte]: rdd
                    //moment().toDate()
                },
            status:'ACTIVE'
            }
        })
        .then(result => {
            let contract_tariff = result.map(item => {
                const {tariff,contract,...contractDtl} = item
        
                return {
                    ...contractDtl,
                    ...contract,
                    ...tariff,
                    valid_from: contractDtl?.valid_from || null,
                    valid_to: contractDtl?.valid_to || null,
                }
            })
            .filter(item => {
                return  moment(rdd).isBetween(item.valid_from,item.valid_to)
            })

            return contract_tariff
        })

        return details
    }
    catch(e){
        throw e
    }
}

/**Used for Generating BUY Draft Bill */
const assignContract = async({data,contracts}) => {
    try {   
        
        const details = data.map(item => {
            const contract = _.find(contracts, c => {
                return c.vendor_group === item.vg_code
            })

            return {
                ...item,
                contract_id: contract?.contract_id || null
            }
        })

        return details

        
    } catch (e) {
        throw e
    }
}

const assignTariff = async ({invoices,contracts}) => {
    
    let data = [];  
   
    for(let i in invoices){ 
        const invoice       = invoices[i];
        let tariff          = null;
        const tariffs       = contracts
        .filter(contract    => contract.contract_id === invoice.contract_id)
        .filter(contract    => {
            const {
                tariff_id,
                service_type,
                from_geo_type,
                from_geo,
                to_geo_type,
                to_geo,
                location,
                vehicle_type,    
                class_of_store,
                sub_service_type,
                contract_type
            } = contract

            const inv_stc_from              = invoice?.ship_point_from[String(from_geo_type).toLowerCase()] || null
            const inv_stc_to                = invoice?.ship_point_to[String(to_geo_type).toLowerCase()] || null
            const invoice_sub_service_type  = String(invoice.sub_service_type).toLowerCase()
            
            if(String(location).toLowerCase()               === String(invoice.location).toLowerCase()      &&
                (String(inv_stc_from).toLowerCase()         === String(from_geo).toLowerCase()              &&
                String(inv_stc_to).toLowerCase()            === String(to_geo).toLowerCase())               &&
                service_type                                === invoice.service_type                        &&
                (invoice_sub_service_type===null?true:(invoice_sub_service_type === String(sub_service_type).toLowerCase())) )
                {
               
                //if tariff has vehicle type maintained
                if(vehicle_type){
              
                    //if tariff is equal to invoice vehicle type
                    if(vehicle_type === invoice.vehicle_type){

                        //if tariff class off store is null 
                        if(!class_of_store){
                            return true
                        }
                        else{
                            //if class of store is not null
                            //check if the invoice class of store is equal to the tariff
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
        });

        if(tariffs.length === 1){
            tariff={
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
                to_geo_type:        tariffs[0].from_geo_type,
                contract_type:      tariffs[0].contract_type
            }
            
            // console.log(tariff)
            
            data.push({
                ...invoice,
                group_id: typeof tariff.group_by === 'string' ?  tariff.group_by.split(',').map(item =>  invoice[item]).join('|') : null,
                tariff
            })

        }
    }

    return data
}

const groupWithAgg = async({data,contract_type}) => {
    try{
        let grouped = []

        const allConditions = await getAggCondition(_.uniq(data.map(item => item.tariff.fk_agg_id))) 
       
        const raw_group = _.groupBy(data,(item)=>{
            return item.group_id
        })

        //if the contract type is buy, get the highest rate per group id
        //console.log(raw_group)
        if(contract_type=='SELL'){
            //Group the invoices per group_id
            //Assigns the corresponding conditions per tariff
            for(const item in raw_group){
                const invoice = raw_group[item][0]

                //get conditions
                let conditions = allConditions.filter(item => item.agg_id === invoice.tariff.fk_agg_id)
                
                //convert the paremeters into array
                const parameters = invoice.tariff.parameter ?  invoice.tariff.parameter.split(',') : null
                
                //group invoices per group_by values 
                const invoices = raw_group[item].map(item => {
                
                    const details = item.details
                    const planned_qty    =sumByQty({data:item.details, uom:item.tariff.min_billable_unit, field:'planned_qty'})
                    const actual_qty     =sumByQty({data:details, uom:item.tariff.min_billable_unit, field:'actual_qty'})
                    const planned_weight =sumBy({data:item.details,field:'planned_weight'})
                    const planned_cbm    =sumBy({data:item.details,field:'planned_cbm'})
                    const actual_weight  =sumBy({data:item.details,field:'actual_weight'})
                    const actual_cbm     =sumBy({data:item.details,field:'actual_cbm'})
                    const return_qty     =sumBy({data:item.details,field:'return_qty'})
                    return {
                        draft_bill_no:      '',
                        delivery_date:      item.rdd,
                        location:           item.location,
                        trip_plan:          item.trip_no,
                        shipment_manifest:  item.shipment_manifest,
                        dr_no:              item.dr_no,
                        invoice_no:         item.invoice_no,
                        br_no:              item.br_no,
                        delivery_status:    item.delivery_status,
                        vehicle_type:       item.vehicle_type,
                        tariff_id:          item.tariff.tariff_id,
                        contract_id:        item.contract_id,
                        service_type:       item.service_type,
                        sub_service_type:   item.sub_service_type,
                        min_billable_value: item.tariff.min_value,
                        max_billable_value: item.tariff.max_value,
                        min_billable_unit:  item.tariff.min_billable_unit,
                        from_geo_type:      invoice.tariff.from_geo_type,
                        ship_from:          item.stc_from,
                        to_geo_type:        invoice.tariff.to_geo_type,
                        ship_to:            item.stc_to,
                        remarks:            item.redel_remarks,
                        class_of_store:     item.class_of_store,
                        planned_qty:        isNaN(planned_qty)   ?  0:planned_qty,
                        actual_qty:         isNaN(actual_qty)    ?  0:actual_qty,
                        planned_weight:     isNaN(planned_weight)?  0:planned_weight,
                        planned_cbm:        isNaN(planned_cbm)   ?  0:planned_cbm,
                        actual_weight:      isNaN(actual_weight) ?  0:actual_weight,
                        actual_cbm:         isNaN(actual_cbm)    ?  0:actual_cbm,
                        return_qty:         isNaN(return_qty)    ?  0:return_qty,
                        fk_invoice_id:      item.fk_invoice_id
                    }
                })

                //create draft bill header
                grouped.push({
                    draft_bill_no:      null,
                    contract_type:      invoice.tariff.contract_type,
                    service_type:       invoice.service_type,
                    draft_bill_date:    null,
                    trip_no:            invoice.trip_no,
                    contract_id:        invoice.contract_id,
                    tariff_id:          invoice.tariff.tariff_id,
                    customer:           invoice.principal_code,
                    vendor:             invoice.trucker_id,
                    location:           invoice.location,
                    ship_from:          invoice.stc_from,
                    ship_point:         invoice.stc_to,
                    delivery_date:      invoice.rdd,
                    rate:               invoice.tariff.tariff_rate,
                    vehicle_type:       invoice.vehicle_type,
                    min_billable_value: invoice.tariff.min_value,
                    max_billable_value: invoice.tariff.max_value,
                    min_billable_unit:  invoice.tariff.min_billable_unit,
                    parameters,
                    tariff:             invoice.tariff,
                    invoices,
                    conditions,
                })
            }

            //Get Conditions and compute the aggregated values per parameter
            //compute the charging
            for(const item in grouped){
                const df = grouped[item]

                //declare variable
                let aggregatedValues = {
                    total_cbm:null,
                    total_weight:null,
                    total_qty:null
                }

                let total_charges = null;

                //Validate if the parameters is null
                //if parameters is null compute weight and cbm only
                //else compute all
                if(df.parameters){
            
                    df.parameters.map(item => {
                        // console.log(df.min_billable_unit)
                        aggregatedValues={
                            ...aggregatedValues,
                            total_cbm:      isNaN (sumBy({data:df.invoices,field:'actual_cbm'})) ?                     0 :   sumBy({data:df.invoices,field:'actual_cbm'}),
                            total_weight:   isNaN (sumBy({data:df.invoices,field:'actual_weight'})) ?                  0 :   sumBy({data:df.invoices,field:'actual_weight'}),
                            total_qty:      sumQtyHeader({data:df.invoices,field:item})//100//isNaN (sumByQty({data:df.invoices,uom:df.min_billable_unit,field:item})) ? null :   sumByQty({data:df.invoices,uom:df.min_billable_unit,field:item})
                        }
                    })
                }
                else{
                    aggregatedValues={
                        ...aggregatedValues,
                        total_cbm:      isNaN (sumBy({data:df.invoices,field:'actual_cbm'})) ? 0     : sumBy({data:df.invoices,field:'actual_cbm'}),
                        total_weight:   isNaN (sumBy({data:df.invoices,field:'actual_weight'})) ? 0  : sumBy({data:df.invoices,field:'actual_weight'}),
                    }
                }
                
                ///Compute total charges
                const {tariff} = df
                const invoice = aggregatedValues

                let aggCondition = {
                    condition:null,
                    formula:null,
                }

                for(const cnd of df.conditions){
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
    
                grouped[item] = {
                    draft_bill_no:      null,
                    contract_type:      df.tariff.contract_type,
                    trip_no:            df.trip_no,
                    service_type:       df.service_type,
                    sub_service_type:   df.sub_service_type,
                    draft_bill_date:    null,
                    contract_id:        df.contract_id,
                    tariff_id:          df.tariff.tariff_id,
                    customer:           df.customer,
                    vendor:             df.vendor,
                    location:           df.location,
                    stc_from:           df.ship_from,
                    stc_to:             df.ship_point,
                    delivery_date:      df.delivery_date,
                    rate:               df.tariff.tariff_rate,
                    vehicle_type:       df.vehicle_type,
                    min_billable_value: df.tariff.min_value,
                    max_billable_value: df.tariff.max_value,
                    min_billable_unit:  df.tariff.min_billable_unit,
                    ...aggCondition,
                    ...aggregatedValues,
                    total_charges,
                    invoices:  df.invoices.map((item,index) => {
                        let billing = 0
                        if(String(df.tariff.min_billable_unit).toLowerCase() === 'cbm'){
                            billing = ( item.actual_cbm / aggregatedValues.total_cbm ) * total_charges
                        }     
                        
                        else if(String(df.tariff.min_billable_unit).toLowerCase() === 'weight'){
                            billing = ( item.actual_weight / aggregatedValues.total_weight ) * total_charges
                        }

                        else if(['CASE','PIECE'].includes(String(df.tariff.min_billable_unit).toUpperCase())){
                            billing = ( item.actual_qty / aggregatedValues.total_qty ) * total_charges
                        }
                        
                        else {
                            if(index === df.invoices.length - 1){
                                billing=Math.floor(total_charges/df.invoices.length)  + (total_charges%df.invoices.length)
                            }   
                            else{
                                billing=Math.floor(total_charges/df.invoices.length)
                            }  
                        }

                        return {
                            ...item,
                            billing: billing.toFixed(2)
                        }
                    })
                    
                }
            }
        }
        else{
            
            for(const item in raw_group){
                const invoice = _.maxBy(raw_group[item], o => o.tariff.tariff_rate)
                //get conditions
                let conditions = allConditions.filter(item => item.agg_id === invoice.tariff.fk_agg_id)
                
                //convert the paremeters into array
                const parameters = invoice.tariff.parameter ?  invoice.tariff.parameter.split(',') : null
                
                //group invoices per group_by values 
                const invoices = raw_group[item].map(item => {
                
                    const details = item.details
                    const planned_qty    =sumByQty({data:item.details, uom:item.tariff.min_billable_unit, field:'planned_qty'})
                    const actual_qty     =sumByQty({data:details, uom:item.tariff.min_billable_unit, field:'actual_qty'})
                    const planned_weight =sumBy({data:item.details,field:'planned_weight'})
                    const planned_cbm    =sumBy({data:item.details,field:'planned_cbm'})
                    const actual_weight  =sumBy({data:item.details,field:'actual_weight'})
                    const actual_cbm     =sumBy({data:item.details,field:'actual_cbm'})
                    const return_qty     =sumBy({data:item.details,field:'return_qty'})
                    return {
                        draft_bill_no:      '',
                        delivery_date:      item.rdd,
                        location:           item.location,
                        trip_plan:          item.trip_no,
                        shipment_manifest:  item.shipment_manifest,
                        dr_no:              item.dr_no,
                        invoice_no:         item.invoice_no,
                        br_no:              item.br_no,
                        delivery_status:    item.delivery_status,
                        vehicle_type:       item.vehicle_type,
                        tariff_id:          item.tariff.tariff_id,
                        contract_id:        item.contract_id,
                        service_type:       item.service_type,
                        sub_service_type:   item.sub_service_type,
                        min_billable_value: item.tariff.min_value,
                        max_billable_value: item.tariff.max_value,
                        min_billable_unit:  item.tariff.min_billable_unit,
                        from_geo_type:      invoice.tariff.from_geo_type,
                        ship_from:          item.stc_from,
                        to_geo_type:        invoice.tariff.to_geo_type,
                        ship_to:            item.stc_to,
                        remarks:            item.redel_remarks,
                        class_of_store:     item.class_of_store,
                        planned_qty:        isNaN(planned_qty)   ?  0:planned_qty,
                        actual_qty:         isNaN(actual_qty)    ?  0:actual_qty,
                        planned_weight:     isNaN(planned_weight)?  0:planned_weight,
                        planned_cbm:        isNaN(planned_cbm)   ?  0:planned_cbm,
                        actual_weight:      isNaN(actual_weight) ?  0:actual_weight,
                        actual_cbm:         isNaN(actual_cbm)    ?  0:actual_cbm,
                        return_qty:         isNaN(return_qty)    ?  0:return_qty,
                        fk_invoice_id:      item.fk_invoice_id
                    }
                })

                //create draft bill header
                grouped.push({
                    draft_bill_no:      null,
                    contract_type:      invoice.tariff.contract_type,
                    service_type:       invoice.service_type,
                    draft_bill_date:    null,
                    trip_no:            invoice.trip_no,
                    contract_id:        invoice.contract_id,
                    tariff_id:          invoice.tariff.tariff_id,
                    customer:           invoice.principal_code,
                    vendor:             invoice.trucker_id,
                    location:           invoice.location,
                    ship_from:          invoice.stc_from,
                    ship_point:         invoice.stc_to,
                    delivery_date:      invoice.rdd,
                    rate:               invoice.tariff.tariff_rate,
                    vehicle_type:       invoice.vehicle_type,
                    min_billable_value: invoice.tariff.min_value,
                    max_billable_value: invoice.tariff.max_value,
                    min_billable_unit:  invoice.tariff.min_billable_unit,
                    parameters,
                    tariff:             invoice.tariff,
                    invoices,
                    conditions,
                })
            }

            //Get Conditions and compute the aggregated values per parameter
            //compute the charging
            for(const item in grouped){
                const df = grouped[item]

                //declare variable
                let aggregatedValues = {
                    total_cbm:null,
                    total_weight:null,
                    total_qty:null
                }

                let total_charges = null;

                //Validate if the parameters is null
                //if parameters is null compute weight and cbm only
                //else compute all
                if(df.parameters){
            
                    df.parameters.map(item => {
                        // console.log(df.min_billable_unit)
                        aggregatedValues={
                            ...aggregatedValues,
                            total_cbm:      isNaN (sumBy({data:df.invoices,field:'actual_cbm'})) ?                     0 :   sumBy({data:df.invoices,field:'actual_cbm'}),
                            total_weight:   isNaN (sumBy({data:df.invoices,field:'actual_weight'})) ?                  0 :   sumBy({data:df.invoices,field:'actual_weight'}),
                            total_qty:      sumQtyHeader({data:df.invoices,field:item})//100//isNaN (sumByQty({data:df.invoices,uom:df.min_billable_unit,field:item})) ? null :   sumByQty({data:df.invoices,uom:df.min_billable_unit,field:item})
                        }
                    })
                }
                else{
                    aggregatedValues={
                        ...aggregatedValues,
                        total_cbm:      isNaN (sumBy({data:df.invoices,field:'actual_cbm'})) ? 0     : sumBy({data:df.invoices,field:'actual_cbm'}),
                        total_weight:   isNaN (sumBy({data:df.invoices,field:'actual_weight'})) ? 0  : sumBy({data:df.invoices,field:'actual_weight'}),
                    }
                }
                
                ///Compute total charges
                const {tariff} = df
                const invoice = aggregatedValues

                let aggCondition = {
                    condition:null,
                    formula:null,
                }

                for(const cnd of df.conditions){
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
    
                grouped[item] = {
                    draft_bill_no:      null,
                    contract_type:      df.tariff.contract_type,
                    trip_no:            df.trip_no,
                    service_type:       df.service_type,
                    sub_service_type:   df.sub_service_type,
                    draft_bill_date:    null,
                    contract_id:        df.contract_id,
                    tariff_id:          df.tariff.tariff_id,
                    customer:           df.customer,
                    vendor:             df.vendor,
                    location:           df.location,
                    stc_from:           df.ship_from,
                    stc_to:             df.ship_point,
                    delivery_date:      df.delivery_date,
                    rate:               df.tariff.tariff_rate,
                    vehicle_type:       df.vehicle_type,
                    min_billable_value: df.tariff.min_value,
                    max_billable_value: df.tariff.max_value,
                    min_billable_unit:  df.tariff.min_billable_unit,
                    ...aggCondition,
                    ...aggregatedValues,
                    total_charges,
                    invoices:  df.invoices.map((item,index) => {
                        let billing = 0
                        if(String(df.tariff.min_billable_unit).toLowerCase() === 'cbm'){
                            billing = ( item.actual_cbm / aggregatedValues.total_cbm ) * total_charges
                        }     
                        
                        else if(String(df.tariff.min_billable_unit).toLowerCase() === 'weight'){
                            billing = ( item.actual_weight / aggregatedValues.total_weight ) * total_charges
                        }

                        else if(['CASE','PIECE'].includes(String(df.tariff.min_billable_unit).toUpperCase())){
                            billing = ( item.actual_qty / aggregatedValues.total_qty ) * total_charges
                        }
                        
                        else {
                            if(index === df.invoices.length - 1){
                                billing=Math.floor(total_charges/df.invoices.length)  + (total_charges%df.invoices.length)
                            }   
                            else{
                                billing=Math.floor(total_charges/df.invoices.length)
                            }  
                        }

                        return {
                            ...item,
                            billing: billing.toFixed(2)
                        }
                    })   
                }    
            }
        }


        

        //Filter draftbills without computed rates
        return grouped.filter(item => item.total_charges)
    }
    catch(e){
        throw e
    }
}

const groupWithoutAgg = async(data) => {
    let ungrouped = []
    const allConditions = await getAggCondition(_.uniq(data.map(item => item.tariff.fk_agg_id)))

    for(const i in data) {
        let invoice = data[i]
        let total_charges=null

        //get the conditions of table
        let conditions = allConditions.filter(item => item.agg_id === invoice.tariff.fk_agg_id)
            
        let invoices = [
            {
                draft_bill_no:      '',
                delivery_date:      invoice.rdd,
                location:           invoice.location,
                trip_plan:          invoice.trip_no,
                shipment_manifest:  invoice.shipment_manifest,
                dr_no:              invoice.dr_no,
                invoice_no:         invoice.invoice_no,
                br_no:              invoice.br_no,
                delivery_status:    invoice.delivery_status,
                vehicle_type:       invoice.vehicle_type,
                tariff_id:          invoice.tariff.tariff_id,
                contract_id:        invoice.contract_id,
                service_type:       invoice.service_type,
                sub_service_type:   invoice.sub_service_type,
                min_billable_value: invoice.tariff.min_value,
                max_billable_value: invoice.tariff.max_value,
                min_billable_unit:  invoice.tariff.min_billable_unit,
                from_geo_type:      invoice.tariff.from_geo_type,
                ship_from:          invoice.stc_from,
                to_geo_type:        invoice.tariff.to_geo_type,
                ship_to:            invoice.stc_to,
                remarks:            invoice.redel_remarks,
                class_of_store:     invoice.class_of_store,
                planned_qty:        sumByQty({data:invoice.details,uom:invoice.tariff.min_billable_unit,field:'planned_qty'}),
                actual_qty:         sumByQty({data:invoice.details,uom:invoice.tariff.min_billable_unit,field:'actual_qty'}),
                planned_weight:     sumBy({data:invoice.details,field:'planned_weight'}),
                planned_cbm:        sumBy({data:invoice.details,field:'planned_cbm'}),
                actual_weight:      sumBy({data:invoice.details,field:'actual_weight'}),
                actual_cbm:         sumBy({data:invoice.details,field:'actual_cbm'}),
                return_qty:         sumBy({data:invoice.details,field:'return_qty'}),
                fk_invoice_id:      invoice.fk_invoice_id,
            }
        ]

        //Assign the aggregated values into draft bill header
        invoice = {
            ...invoice,
            total_cbm:      invoices[0].actual_cbm      || 0,
            total_weight:   invoices[0].actual_weight   || 0,
            total_qty:      invoices[0].actual_qty      || 0
        }

        //declare the condition variables
        let aggCondition = {
            condition:null,
            formula:null,
        }
        
        for(const cnd of conditions){
            const conditon = cnd.raw_condition.split(',').join('')
            const fn = new Function(['tariff','invoice'],'return ' +conditon)
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
    
        ungrouped.push({
            draft_bill_no:      null,
            contract_type:      invoice.tariff.contract_type,
            draft_bill_date:    null,
            contract_id:        invoice.contract_id,
            service_type:       invoice.service_type,
            tariff_id:          invoice.tariff.tariff_id,
            customer:           invoice.principal_code,
            vendor:             null,
            location:           invoice.location,
            stc_from:           invoice.stc_from,
            stc_to:             invoice.stc_to,
            delivery_date:      invoice.rdd,
            rate:               invoice.tariff.tariff_rate,
            vehicle_type:       invoice.vehicle_type,
            min_billable_value: invoice.tariff.min_value,
            max_billable_value: invoice.tariff.max_value,
            min_billable_unit:  invoice.tariff.min_billable_unit,
            total_cbm:          invoice.total_cbm,
            total_weight:       invoice.total_weight,
            total_qty:          invoice.total_qty,
            total_charges,
            formula:            aggCondition.formula,
            condition:          aggCondition.condition,
            invoices:           invoices.map(item => {

                return {
                    ...item,
                    billing:total_charges
                }
            })    
        })
        
    }

    return ungrouped.filter(item => item.total_charges)
}

/*Sell Process Starts here*/
exports.generateDraftBill = async({deliveryDate,location}) => {
    try{
        
        let draft_bills = []
        /*A. Get Invoices
        1. Assignment of Contracts per Invoices */
        const invoices = await getAllInvoice({
            filters:{
                rdd:deliveryDate,
                location,
                is_processed_sell:false,
            }
        })

        /*B. Assignment of Tariffs Per Contract 
        1.Get Contracts
        2.Assignment of Tariff per Invoice based on retrieved contracts*/
        const contracts =   await getContracts({data:invoices,contract_type:'SELL',rdd:deliveryDate});
        const data      =   await assignTariff({invoices,contracts})

        /*C. Invoice Grouping
            1. Assign Formula per Condition
            2. Compute Rate
        */
        const withAgg       = await groupWithAgg({data:data.filter(item => item.tariff.with_agg),contract_type:'SELL'})
        const withOutAgg    = await groupWithoutAgg(data.filter(item => !item.tariff.with_agg))
        
        /**Append generated draft_bills */
        draft_bills = draft_bills.concat(withAgg).concat(withOutAgg)

        return draft_bills
    }
    catch(e){
        throw e
    }  
}
/*Sell Process Ends here*/

/*Buy Process Starts here*/
exports.generateDraftBillBuy = async({deliveryDate,location}) => {
    try{   
        let draft_bills = [];

         /*A. Get Invoices
        1. Assignment of Vendor Groups Per Invoices */
        const invoices = await getBuyInvoice({
            filters:{
                rdd:deliveryDate,
                location,
                is_processed_buy:false
            }
        })

        /*B. Assignment of Tariffs Per Contract 
        1.Get Contracts
        2.Assignment of Contract per Invoice
        3.Assignment of Tariff per Invoice based on contract*/
        const contracts =           await getContracts({contract_type:'BUY',data:invoices,rdd:deliveryDate});
        const invoices_contract =   await assignContract({contracts,data:invoices})
        const data =                await assignTariff({invoices:invoices_contract,contracts})
        /*C. Invoice Grouping
            1. Assign Formula per Condition
            2. Compute Rate
        */
        const withAgg    = await groupWithAgg({data:data.filter(item => item.tariff.with_agg),contract_type:'BUY'})
        const withOutAgg = await groupWithoutAgg(data.filter(item => !item.tariff.with_agg))
        
         /**Combine generated draft_bills */
        draft_bills = draft_bills.concat(withAgg).concat(withOutAgg)

        return draft_bills
    }
    catch(e){
        throw e
    }
}
/*Buy Process ends here*/

/*Replan Sell Process Starts here*/
exports.replanDraftBill = async({deliveryDate,location})=>{
    try{
        let draft_bills=[]


        /*1. Get Revenue Leak Invoives
          2. Assign Contract to Invoices  
        */
        
        const invoices = await getAllRevenueLeakInvoices({
            rdd:deliveryDate,
            location,
            contract_type:'SELL'
        })

        // return invoices

         /*B. Assignment of Tariffs Per Contract 
        1.Get Contracts
        2.Assignment of Tariff per Invoice based on retrieved contracts*/
        const contracts =   await getContracts({data:invoices,contract_type:'SELL',rdd:deliveryDate});
        const data      =   await assignTariff({invoices,contracts})
        
        const withAgg       = await groupWithAgg({data:data.filter(item => item.tariff.with_agg),contract_type:'SELL'})
        const withOutAgg    = await groupWithoutAgg(data.filter(item => !item.tariff.with_agg))
        
        /**Append generated draft_bills */
        draft_bills = draft_bills.concat(withAgg).concat(withOutAgg)

        return draft_bills
    }
    catch(e){
        throw e
    }
}
/*Replan Sell Process Ends here*/

/**Replan Buy Process Starts Here */
exports.replanDraftBillBuy = async({deliveryDate,location})=>{
    try{
        let draft_bills = [];
        
         /*A. Get Invoices
        1. Assignment of Vendor Groups Per Invoices */
        const invoices = await getAllRevenueLeakInvoices({
            rdd:deliveryDate,
            location,
            contract_type:'BUY'
        })

        /*B. Assignment of Tariffs Per Contract 
        1.Get Contracts
        2.Assignment of Contract per Invoice
        3.Assignment of Tariff per Invoice based on contract*/
        const contracts =           await getContracts({contract_type:'BUY',data:invoices,rdd:deliveryDate});
        const invoices_contract =   await assignContract({contracts,data:invoices})
        const data =                await assignTariff({invoices:invoices_contract,contracts})

        /*C. Invoice Grouping
            1. Assign Formula per Condition
            2. Compute Rate
        */
        const withAgg    = await groupWithAgg({data:data.filter(item => item.tariff.with_agg),contract_type:'BUY'})
        const withOutAgg = await groupWithoutAgg(data.filter(item => !item.tariff.with_agg))
        
         /**Combine generated draft_bills */
        draft_bills = draft_bills.concat(withAgg).concat(withOutAgg)

            
        return draft_bills
    }
    catch(e){
        throw e
    }
}
/**Replan Buy Process Ends Here */
exports.createDraftBillTransaction = async({header,details,revenueLeak,contract_type})=>{
    try{

        return await dataLayer.createDraftBillTransaction({
            header,
            details,
            revenueLeak,
            contract_type
        })

    }   
    catch(e){
        throw e
    }
}














