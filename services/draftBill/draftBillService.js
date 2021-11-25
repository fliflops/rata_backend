const _ = require('lodash');
const dataLayer = require('./draftBillDatalayer');
const invoiceService = require('../invoice/invoiceService');
const contratService = require('../contract/contractService');
const tariffService = require('../tariff/tariffService');
const aggService = require('../aggregation/aggregation');
const moment = require('moment');

const getContracts = async(data) => {
    const contractID= _.uniq(data.map(item => item.contract_id).filter(item => item !== null))
    let details = await contratService.getContractDetails({
        filters:{
            contract_id:contractID
        }
    })

    for(let contract of details){
        const tariffs = await tariffService.getTariff({
            filters:{
                tariff_id:contract.tariff_id
            }
        })

        const index = details.findIndex(x => x.tariff_id === tariffs.tariff_id)
        details[index] = {
            ...details[index],
            ...tariffs
        }
    }
    return details
}

const sumByQty = ({data,uom,field}) => {
    return _.sumBy(data.filter(item => item.uom === uom),item => parseFloat(item[field]))
}

const sumBy = ({data,field}) => {
    return _.sumBy(data,item => parseFloat(item[field]))
}

const getAllInvoice = async (rdd) => {
    try{
        let {noContracts,data} = await invoiceService.getAllInvoice({
            filters:{
                is_processed_sell:false,
                rdd,
                //principal_code: '10005'
            }
        })
        .then(async result => {
            const data =  result.map(item => {
                const {contract,...newItem} = item
                const contract_id = typeof contract?.contract_id !== 'undefined' ? contract.contract_id : null   
                
                return {
                    ...newItem,
                    contract_id
                }
            })
            
            //Get the datas with contracts
            const withContracts = data.filter(item => item.contract_id && item.ship_point_to && item.ship_point_from)
            
            //removed the invoices without contract
            const withoutContracts = data.filter(item => !withContracts.map(item => item.id).includes(item.id)).map( i => {
                let reason = null
                if(!i.ship_point_to || i.ship_point_from){
                    reason = 'NO SHIP POINT INFORMATION'
                }
                else if(!i.contract_id){
                    reason = 'NO CONTRACT'
                }

                return {
                    ...i,
                    reason
                }
            })
           
            return {
                data:  withContracts ,              
                noContracts: withoutContracts//data.filter(item => )
            }
        })

        //Assign Class of Store into the header
        let invoiceWithClassOfStore = []       
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

        // console.log(invoiceWithClassOfStore)

        return {
            data:invoiceWithClassOfStore,
            noContracts
        }
    }
    catch(e){
        throw e
    }
    
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

const groupWithAgg = async(data) => {
    try{
        let grouped = []

        const allConditions = await getAggCondition(_.uniq(data.map(item => item.tariff.fk_agg_id)))// 
        
        const raw_group = _.groupBy(data,(item)=>{
            return item.group_id
        })

        //Group the invoices per group_id
        //Assigns the corresponding conditions per tariff
        for(const item in raw_group){
            const invoice = raw_group[item][0]

            //get conditions
            let conditions = allConditions.filter(item => item.agg_id = invoice.tariff.fk_agg_id)
            //await getAggCondition(invoice.tariff.fk_agg_id)
            
            //convert the paremeters into array
            const parameters = invoice.tariff.parameter ?  invoice.tariff.parameter.split(',') : null
            
            //group invoices per group_by values 
            const invoices = raw_group[item].map(item => {
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
                    sub_service_type:   null,
                    min_billable_value: item.tariff.min_value,
                    min_billable_unit:  item.tariff.min_billable_unit,
                    from_geo_type:      invoice.tariff.from_geo_type,
                    ship_from:          item.stc_from,
                    to_geo_type:        invoice.tariff.to_geo_type,
                    ship_to:            item.stc_to,
                    remarks:            null,
                    class_of_store:     item.class_of_store,
                    planned_qty:        sumByQty({data:item.details,uom:item.tariff.min_billable_unit,field:'planned_qty'}),
                    actual_qty:         sumByQty({data:item.details,uom:item.tariff.min_billable_unit,field:'actual_qty'}),
                    planned_weight:     sumBy({data:item.details,field:'planned_weight'}),
                    planned_cbm:        sumBy({data:item.details,field:'planned_cbm'}),
                    actual_weight:      sumBy({data:item.details,field:'actual_weight'}),
                    actual_cbm:         sumBy({data:item.details,field:'actual_cbm'}),
                    return_qty:         sumBy({data:item.details,field:'return_qty'}),
                    fk_invoice_id:      item.fk_invoice_id
                }
            })

           

            //create draft bill header
            grouped.push({
                draft_bill_no:      null,
                contract_type:      invoice.tariff.tariff_type,
                service_type:       invoice.service_type,
                draft_bill_date:    null,
                contract_id:        invoice.contract_id,
                tariff_id:          invoice.tariff.tariff_id,
                customer:           invoice.principal_code,
                vendor:             null,
                location:           invoice.location,
                ship_from:          invoice.stc_from,
                ship_point:         invoice.stc_to,
                delivery_date:      invoice.rdd,
                rate:               invoice.tariff.tariff_rate,
                vehicle_type:       invoice.vehicle_type,
                min_billable_value: invoice.tariff.min_value,
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
                    aggregatedValues={
                        ...aggregatedValues,
                        total_cbm:      sumBy({data:df.invoices,field:'actual_cbm'}),
                        total_weight:   sumBy({data:df.invoices,field:'actual_weight'}),
                        total_qty:      sumByQty({data:df.invoices,uom:df.min_billable_unit,field:item})
                    }
                })
            }
            else{
                aggregatedValues={
                    ...aggregatedValues,
                    total_cbm:      sumBy({data:df.invoices,field:'actual_cbm'}),
                    total_weight:   sumBy({data:df.invoices,field:'actual_weight'}),
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
                    total_charges = fnFormula(tariff,invoice)
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
                contract_type:      df.tariff.tariff_type,
                service_type:       df.service_type,
                draft_bill_date:    null,
                contract_id:        df.contract_id,
                tariff_id:          df.tariff.tariff_id,
                customer:           df.customer,
                vendor:             null,
                location:           df.location,
                stc_from:           df.ship_from,
                stc_to:             df.ship_point,
                delivery_date:      df.delivery_date,
                rate:               df.tariff.tariff_rate,
                vehicle_type:       df.vehicle_type,
                min_billable_value: df.tariff.min_value,
                min_billable_unit:  df.tariff.min_billable_unit,
                ...aggCondition,
                ...aggregatedValues,
                total_charges,
                invoices:           df.invoices.map(item => {
                    let billing = null
                    if(df.tariff.min_billable_unit === 'cbm'){
                        billing = ( item.actual_cbm / aggregatedValues.total_cbm ) * total_charges
                    }     
                    
                    if(df.tariff.min_billable_unit === 'weight'){
                        billing = ( item.actual_weight / aggregatedValues.total_weight ) * total_charges
                    }

                    if(['CASE','PIECE'].includes(df.tariff.min_billable_unit)){
                        billing = ( item.actual_qty / aggregatedValues.total_qty ) * total_charges
                    }

                    return {
                        ...item,
                        billing: isNaN(billing) ? null : billing
                    }
                })
            }
        }

        return grouped
    }
    catch(e){
        throw e
    }
}

const groupWithoutAgg = async(data) => {
    let ungrouped = []
    const allConditions = await getAggCondition(_.uniq(data.map(item => item.tariff.fk_agg_id)))
    
    // console.log(data.filter(item => item.tariff.fk_agg_id === 'Xdock_cbm_agg_wmin'))
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
                sub_service_type:   null,
                min_billable_value: invoice.tariff.min_value,
                min_billable_unit:  invoice.tariff.min_billable_unit,
                from_geo_type:      invoice.tariff.from_geo_type,
                ship_from:          invoice.stc_from,
                to_geo_type:        invoice.tariff.to_geo_type,
                ship_to:            invoice.stc_to,
                remarks:            null,
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
            total_cbm:invoices[0].actual_cbm,
            total_weight:invoices[0].actual_weight,
            total_qty:invoices[0].actual_qty
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
                total_charges = fnFormula(invoice.tariff,invoice)
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
            contract_type:      invoice.tariff.tariff_type,
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
            }),
            // conditions:         aggCondition,
            // tariff:             invoice.tariff,
    
        })
        
    }

    return ungrouped
}

const assignTariff = ({invoices,contracts}) => {
    let data = [];  
    let withoutTariff = [];
    for(let i in invoices){
        const invoice = invoices[i];
        let tariff=null;
        const tariffs = contracts.filter(contract => {
            const {
                tariff_id,
                service_type,
                from_geo_type,
                from_geo,
                to_geo_type,
                to_geo,
                location,
                vehicle_type,    
                class_of_store
            } = contract

            const inv_stc_from = invoice.ship_point_from[from_geo_type]
            const inv_stc_to = invoice.ship_point_to[to_geo_type]
        
            
            if(location === invoice.location
                && (inv_stc_from === from_geo && inv_stc_to === to_geo)
                && service_type === invoice.service_type){
                
                //if tariff has vehicle type maintained
                if(vehicle_type){
                    //if tariff is equal to invocie vehicle type
                    if(vehicle_type === invoice.vehicle_type){
                        //if class off store is null 
                        if(!class_of_store){
                            return true
                        }
                        else{
                            //if class of store is not null
                            //check if the invoice class of store is equal to the tariff
                            if(class_of_store === invoice.class_of_store){
                                return true
                            }

                            return false
                        }
                    } 
                    return false 
                }
                else{
                    //if vehicle type is null
                    //check if the invoice class of store is equal to the tariff
                    if(class_of_store === invoice.class_of_store){
                        return true
                    }
                    return false
                }  
            }
            //return false if the primary conditions are not meant
            return false
        });

        // Check if the system finds more than 1 tariff
        if(tariffs.length > 1 || tariffs.length === 0){
            let reason = null
            //proceed to next invoice
            //assign the invoice to revenue leak
            if(tariffs.length > 1){
                reason='DUPLICATE TARIFF'
            }
            else if(tariffs.length === 0){
                reason='NO TARIFF'
            }

            withoutTariff.push({
                ...invoice,
                reason
            })
        }
        else{
            tariff = {
                tariff_id:          tariffs[0].tariff_id,
                tariff_type:        tariffs[0].tariff_type,
                min_billable_unit:  tariffs[0].min_billable_unit,
                min_value:          tariffs[0].min_value,
                tariff_rate:        tariffs[0].tariff_rate,
                group_by:           tariffs[0].group_by,
                parameter:          tariffs[0].parameter,
                with_agg:           tariffs[0].with_agg,
                fk_agg_id:          tariffs[0].fk_agg_id,
                from_geo_type:      tariffs[0].from_geo_type,
                to_geo_type:        tariffs[0].from_geo_type
            }
    
            data.push({
                ...invoice,
                group_id:tariff.group_by.split(',').map(item =>  invoice[item]).join('|'),
                tariff,
                
            })
        }
    }

    return {data,withoutTariff}
}

exports.generateDraftBill = async({
    deliveryDate
}) => {
    try{
        let revenueLeak = [];
        //1. Get All invoices per delivery date
        let {data,noContracts} = await getAllInvoice(deliveryDate)
       
        //2. Add Items without contract to revenue leak
        // revenueLeak = revenueLeak.concat(insertToRevenueLeak({data:noContracts,reason:'NO CONTRACT'}))

        //3. Get contract from the selected invoices
        const contracts = await getContracts(data);
        //4. Assign Tariff to Invoice using the retrieved contracts
        const dataWithTariff = await assignTariff({
            invoices:data,
            contracts
        });

        data = dataWithTariff.data;
        
        //group the invoices with aggregation flag 
        const withAgg = await groupWithAgg(data.filter(item => item.tariff.with_agg));

        // //group the invoices without aggregation flag
        const withOutAgg = await groupWithoutAgg(data.filter(item => !item.tariff.with_agg))

        //push to revenue leak
        dataWithTariff.withoutTariff.map(item => {
            revenueLeak.push({
                invoice_no: item.invoice_no.split('-')[0],
                draft_bill_type: 'SELL',
                fk_invoice_id: item.fk_invoice_id,
                reason: item.reason,
            })
        })

        noContracts.map(item => {
            revenueLeak.push({
                invoice_no:     item.invoice_no,
                draft_bill_type:'SELL',
                fk_invoice_id:  item.id,
                reason:         item.reason
            })
        })

        //remove the duplicates
        revenueLeak = _.uniqBy(revenueLeak,'fk_invoice_id')

     
        //update invoices
        await invoiceService.updateInvoice({
            data:{
                is_processed_sell:true
            },
            filters:{
                id:revenueLeak.map(item => item.fk_invoice_id).concat(_.uniqBy(data,'fk_invoice_id').map(item => item.fk_invoice_id))

            }
        })
                
        return {draftBill: withAgg.concat(withOutAgg),revenueLeak}
    }
    catch(e){
        throw e
    }
}

const draftBillCount = async() => {
    try {
        const getCount = await dataLayer.rawGetDraftBillCount({
            createdAt:moment().format("YYYY-MM-DD")
        })
        return getCount
    } 
    catch (error) {
        throw error
    }
}

const generateDraftBillNo = async({count}) => {
    try {
        return `DB-${moment().format('MMDDYYYY')}-${String(count).padStart(5,"00000")}`    
    } 
    catch (error) {
        throw error
    }
}

exports.createDraftBill = async(draftBills) => {
    try{

        let count = await draftBillCount();
        //remove the invoices without computed total charges
        let data = draftBills.filter(item => item.total_charges)
        let invData = [];
            
        for(const i in data){
            let {invoices,...draftBill} = data[i]
            count = count+=1
            let draftBillNo = await generateDraftBillNo({
                count
            })

            // console.log(draftBillNo)

            data[i] = {
                ...draftBill,
                draft_bill_no:draftBillNo,
                draft_bill_date:moment().format('YYYY-MM-DD'),
                status:'DRAFT_BILL'
            }

            invData.push(...invoices.map(item => {
                return {
                    ...item,
                    draft_bill_no:draftBillNo
                }
            }))
            
        }

        await dataLayer.createDraftBillTransaction({
            header:data,
            details:invData
        })

        return {data,invData}
    }
    catch(e){
        throw e
    }
}

exports.getPaginatedDraftBill = async({
    filters,
})=>{
    try{
        let {orderBy,page,totalPage,...newFilters} = filters
        return await dataLayer.getPaginatedDraftBill({
            orderBy:orderBy.split(','),
            page,
            totalPage,
            filters:{
                ...newFilters
            }
        })
    }
    catch(e){
        throw e
    }
}


exports.getAllInvoices = async({
    filters 
}) => {
    try{
        return await dataLayer.getAllInvoices({
            filters
        })
    }
    catch(e){
        throw e
    }

}

exports.getAllDraftBills = async({
    filters
})=>{
    try{
        return await dataLayer.getAllDraftBills({
            filters
        })

    }
    catch(e){
        throw e
    }
}

exports.generateDraftBillBuy = () => {
    try{
        
    } catch (e) {
        
    }
}