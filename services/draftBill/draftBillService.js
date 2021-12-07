const _ = require('lodash');
const dataLayer = require('./draftBillDatalayer');
const invoiceService = require('../invoice/invoiceService');
const contratService = require('../contract/contractService');
const tariffService = require('../tariff/tariffService');
const vendorService = require('../vendor/vendorService');
const aggService = require('../aggregation/aggregation');
const moment = require('moment');

const getContracts = async(data) => {
    try{
        const contractID= _.uniq(data.map(item => item.contract_id).filter(item => item !== null))
        let details = await contratService.getContractDetails({
            filters:{
                contract_id:contractID,
                '$contract.contract_type$':'SELL',

            }
        })
        .then(result => {
            let contract_tariff = result.map(item => {
                const {tariff,contract,...contractDtl} = item

                return {
                    ...contractDtl,
                    ...contract,
                    ...tariff
                }
            })
            return contract_tariff
        })

        // console.log(details)
        return details
    }
    catch(e){
        throw e
    }
}

const sumByQty = ({data,uom,field}) => {
    return _.sumBy(data.filter(item => item.uom === uom),item => parseFloat(item[field]))
}

const sumBy = ({data,field}) => {
    return _.sumBy(data,item => parseFloat(item[field]))
}

const getAllInvoice = async ({
    filters
}) => {
    try{
        let {noContracts,data} = await invoiceService.getAllInvoice({
            filters:{
                ...filters,
            }
        })
        .then(async result => {
            const data =  result.map(item => {
                let {contract,vendor_group,...newItem} = item
                const contract_id = typeof contract?.contract_id !== 'undefined' ? contract.contract_id : null
                const contract_type = typeof contract?.contract_type !== 'undefined' ? contract.contract_type : null
                // const vg_code = typeof vendor_group?.vg_code !== 'undefined' ? vendor_group.vg_code:null
     
                return {
                    ...newItem,
                    contract_id,
                    contract_type
                   // vg_code
                }
            })
            
            //Get the datas with contracts
            const withContracts = data.filter(item => 
                item.contract_id   && 
                item.ship_point_to && 
                item.ship_point_from &&
                item.is_billable
                )
            
            //removed the invoices without contract for sell side
            const withoutContracts = data.filter(item => !withContracts.map(item => item.id).includes(item.id)).map( i => {
                let reason = null
                if(!i.ship_point_to || i.ship_point_from){
                    reason = 'NO SHIP POINT INFORMATION'
                }
                else if(!i.contract_id){
                    reason = 'NO CONTRACT'
                }
                else if(!i.is_billable){
                    reason = 'NOT BILLABLE'
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
                const planned_qty    =sumByQty({data:item.details,uom:item.tariff.min_billable_unit,field:'planned_qty'})
                const actual_qty     =sumByQty({data:item.details,uom:item.tariff.min_billable_unit,field:'actual_qty'})
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
                    sub_service_type:   null,
                    min_billable_value: item.tariff.min_value,
                    min_billable_unit:  item.tariff.min_billable_unit,
                    from_geo_type:      invoice.tariff.from_geo_type,
                    ship_from:          item.stc_from,
                    to_geo_type:        invoice.tariff.to_geo_type,
                    ship_to:            item.stc_to,
                    remarks:            item.redel_remarks,
                    class_of_store:     item.class_of_store,
                    planned_qty:        isNaN(planned_qty)   ?  null:planned_qty,
                    actual_qty:         isNaN(actual_qty)    ?  null:actual_qty,
                    planned_weight:     isNaN(planned_weight)?  null:planned_weight,
                    planned_cbm:        isNaN(planned_cbm)   ?  null:planned_cbm,
                    actual_weight:      isNaN(actual_weight) ?  null:actual_weight,
                    actual_cbm:         isNaN(actual_cbm)    ?  null:actual_cbm,
                    return_qty:         isNaN(return_qty)    ?  null:return_qty,
                    fk_invoice_id:      item.fk_invoice_id
                }
            })

            //create draft bill header
            grouped.push({
                draft_bill_no:      null,
                contract_type:      invoice.tariff.contract_type,
                service_type:       invoice.service_type,
                draft_bill_date:    null,
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
                        total_cbm:      isNaN (sumBy({data:df.invoices,field:'actual_cbm'})) ? null     : sumBy({data:df.invoices,field:'actual_cbm'}),
                        total_weight:   isNaN (sumBy({data:df.invoices,field:'actual_weight'})) ? null  : sumBy({data:df.invoices,field:'actual_weight'}),
                        total_qty:      isNaN (sumByQty({data:df.invoices,uom:df.min_billable_unit,field:item})) ? null : sumByQty({data:df.invoices,uom:df.min_billable_unit,field:item})
                    }
                })
            }
            else{
                aggregatedValues={
                    ...aggregatedValues,
                    total_cbm:      isNaN (sumBy({data:df.invoices,field:'actual_cbm'})) ? null     : sumBy({data:df.invoices,field:'actual_cbm'}),
                    total_weight:   isNaN (sumBy({data:df.invoices,field:'actual_weight'})) ? null  : sumBy({data:df.invoices,field:'actual_weight'}),
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
                contract_type:      df.tariff.contract_type,
                service_type:       df.service_type,
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
                min_billable_unit:  df.tariff.min_billable_unit,
                ...aggCondition,
                ...aggregatedValues,
                total_charges,
                invoices:           df.invoices.map(item => {
                    let billing = 0
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
                        billing: parseFloat(billing).toFixed(9)
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

    return ungrouped
}

const assignTariff = ({invoices,contracts}) => {
    //console.log(invoices,contracts)
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
                class_of_store,
                contract_type
            } = contract

            // console.log(contract)

            const inv_stc_from = invoice.ship_point_from[from_geo_type]
            const inv_stc_to = invoice.ship_point_to[to_geo_type]
            
            if(String(location).toLowerCase() === String(invoice.location).toLowerCase()
                && (inv_stc_from === from_geo && inv_stc_to === to_geo)
                && service_type === invoice.service_type){
                
                //if tariff has vehicle type maintained
                if(vehicle_type){
                    //if tariff is equal to invoice vehicle type
                    if(vehicle_type === invoice.vehicle_type){
                        //if class off store is null 
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
                    //if vehicle type is null
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

        // console.log(tariffs)

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
                to_geo_type:        tariffs[0].from_geo_type,
                contract_type:      tariffs[0].contract_type
            }
    
            data.push({
                ...invoice,
                group_id:tariff.group_by.split(',').map(item =>  invoice[item]).join('|'),
                tariff
            })
        }
    }

    return {data,withoutTariff}
}

exports.generateDraftBill = async({
    deliveryDate,
    location
}) => {
    try{
        let revenueLeak = [];
        //1. Get All invoices per delivery date
        let {data,noContracts} = await getAllInvoice({
            filters:{
                rdd:deliveryDate,
                is_processed_sell:false,
                location
            }
        })
       
        //2. Get contract from the selected invoices
        const contracts = await getContracts(data);
        
        //3. Assign Tariff to Invoice using the retrieved contracts
        const dataWithTariff = await assignTariff({
            invoices:data,
            contracts
        });

        data = dataWithTariff.data;
        
        //#4.1 group the invoices with aggregation flag 
        const withAgg = await groupWithAgg(data.filter(item => item.tariff.with_agg));

        //4.2 group the invoices without aggregation flag
        const withOutAgg = await groupWithoutAgg(data.filter(item => !item.tariff.with_agg))
        //5. push to revenue leak
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
        // await invoiceService.updateInvoice({
        //     data:{
        //         is_processed_sell:true
        //     },
        //     filters:{
        //         id:revenueLeak.map(item => item.fk_invoice_id).concat(_.uniqBy(data,'fk_invoice_id').map(item => item.fk_invoice_id))

        //     }
        // })

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
        return `${moment().format('MMDDYY')}-${String(count).padStart(5,"00000")}`    
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

const getBuyContracts = async({
    invoices
}) =>{  
    try{
        const vendor_groups = _.uniq(invoices.map(item => item.vg_code))
        const contracts = await contratService.getContractDetails({
            filters:{
                '$contract.vendor_group$':vendor_groups,
                '$contract.contract_type$':'BUY'
            }
        })
        .then(result =>{
            let contract_tariff = result.map(item => {
                const {tariff,contract,...contractDtl} = item
                
                return {
                    ...contractDtl,
                    ...tariff,
                    vendor_group:contract.vendor_group,
                    contract_type:contract.contract_type
                }
            })
            return contract_tariff 
        })

        //assign contract id
        const details = invoices.map(item => {
            const contract = _.find(contracts,c =>{
                return c.vendor_group === item.vg_code
            })

            // console.log(item.vg_code)
            return {
                ...item,
                contract_id: typeof contract?.contract_id === 'undefined' ? null : contract.contract_id
            }
        })

        return {
            contracts,
            data:details
        }
    }
    catch(e){
        throw e
    }

}

const getBuyInvoice =async({
    filters
}) => {
    try {

        let {noVendorGroup,data} = await invoiceService.getAllInvoice({
            filters:{
                ...filters,
            }
        })
        .then(async result => {
            const data =  result.map(item => {
                let {contract,vendor_group,...newItem} = item
                //const contract_id = typeof contract?.contract_id !== 'undefined' ? contract.contract_id : null
                const vg_code = typeof vendor_group?.vg_code !== 'undefined' ? vendor_group.vg_code:null
                
                return {
                    ...newItem,
                    contract_id:null,
                    vg_code,
                    fk_invoice_id:item.id
                }
            })

            //console.log(data)
            
            //Get the datas with vendor group
            const withVendorGroup = data.filter(item => item.vg_code && item.ship_point_to && item.ship_point_from)
            // const withContracts = data.filter(item => item.contract_id && item.ship_point_to && item.ship_point_from)
            
            const withoutVendorGroup = data.filter(item => !withVendorGroup.map(item => item.id).includes(item.id)).map( i => {
                let reason = null
                if(!i.ship_point_to || i.ship_point_from){
                    reason = 'NO SHIP POINT INFORMATION'
                }
                else if(!i.vendor_group){
                    reason = 'NO VENDOR GROUP'
                }

                return {
                    ...i,
                    reason
                }
            })
            
            return {
                data:  withVendorGroup ,              
                noVendorGroup: withoutVendorGroup//data.filter(item => )
            }
        })


        return{
            noVendorGroup,
            data
        }
        
    } 
    catch (e) {
        throw e
    }
}

exports.generateDraftBillBuy = async({rdd,location}) => {
    try{

        let revenueLeak = [];

        //1. Get All invoices per delivery date
        let {data,noVendorGroup} = await getBuyInvoice({
            filters:{
                rdd,
                location,
                    is_processed_buy:false
            }
        })

        //2. Get contract details from the selected invoices
        const contracts = await getBuyContracts({invoices:data.filter(item => item.vg_code)})
        data = contracts.data

        //3. Assign Tariff to Invoice using the retrieved contracts
        const dataWithTariff = await assignTariff({
            invoices:data,
            contracts:contracts.contracts
        })

        data=dataWithTariff.data

        //4. group the invoices with aggregation flag 
        const withAgg = await groupWithAgg(data.filter(item => item.tariff.with_agg));

        //5. push to revenue leak
        dataWithTariff.withoutTariff.map(item => {
            revenueLeak.push({
                invoice_no: item.invoice_no,
                draft_bill_type:'BUY',
                fk_invoice_id:item.fk_invoice_id,
                reason:item.reason
            })
        })

        noVendorGroup.map(item => {
            revenueLeak.push({
                invoice_no:     item.invoice_no,
                draft_bill_type:'SELL',
                fk_invoice_id:  item.id,
                reason:         item.reason
            })
        })

        //5.1 remove the duplicates
        revenueLeak = _.uniqBy(revenueLeak,'fk_invoice_id')

        //6. Update Invoices
        await invoiceService.updateInvoice({
            data:{
                is_processed_buy:true
            },
            filters:{
                id:revenueLeak.map(item => item.fk_invoice_id).concat(_.uniqBy(data,'fk_invoice_id').map(item => item.fk_invoice_id))
            }
        })

        return {
            draftBill:withAgg,
            revenueLeak:revenueLeak   
        }
    } 
    catch (e) {
        throw e
    }
}

