const {getAllDraftBills, getAllInvoices} = require('../draftBill');
const {getAllRevenueLeak,getRevenueLeakDetails} = require('../invoice');
const {getAllLocation} = require('../location');
const {getAllPrincipal} = require('../principal');
const {getAllShipPoint} = require('../shipPoint');
const {getAllVendor,getAllVendorGroup,getAllVendorGroupDtl} = require('../vendor');
const {getContractDetails} = require('../contract');
const {getAllQuickCodes} = require('../quickCodes')
const {getAllAggCondition,getAllAggregation} = require('../aggregation');
const {service} = require('../wms-draftbill')
const {wmsRevenueLeakService} = require('../wms-revenueLeak');

const xlsx = require('xlsx');
const sequelize = require('sequelize')
const _ = require('lodash')

const wmsDraftBillService =service;

const generateExcel = (data) => {
    try{
        //create work book        
        const wb = xlsx.utils.book_new();
      
        //get the object name 
        Object.keys(data).map(item => {
            const ws = xlsx.utils.json_to_sheet(data[item]);
            xlsx.utils.book_append_sheet(wb,ws,item);
        })

        return buf = xlsx.write(wb,{
            type:'buffer', bookType:"xlsx"
        })

    }
    catch(e){
        throw e
    }
}

exports.exportDraftBill = async({
    location,
    // delivery_date,
    from,
    to,
    contract_type
}) => {
    try{
        let draftBill = {}

        const headers = await getAllDraftBills({
            filters:{
                location,
                delivery_date:{
                    [sequelize.Op.between]:[from,to]
                },
                contract_type,
                
            }
        })

        const details = await getAllInvoices({
            filters:{
                draft_bill_no: headers.map(item => item.draft_bill_no)

            }
        })


        draftBill = {
            headers,
            details
        }

        const buffer = generateExcel(draftBill)
        return buffer
    }
    catch(e){
        throw e
    }
}

exports.exportRevenueLeak = async({
    location,
    from,
    to,
    contract_type
}) => {
    try {

        const data = await getAllRevenueLeak({
            filters:{
                draft_bill_type: contract_type,
                ['$invoice.location$']:location,
                // ['$invoice.rdd$']:delivery_date
                ['$invoice.rdd$']:{
                    [sequelize.Op.between]:[from,to]
                }
            }
        })
        .then(result => {
            return result.map(item => {
                const {contract,ship_point_from,ship_point_to,details,vendor_group,principal_tbl,...newItem}=item
                return {
                    ...newItem,
                    ship_point_from_name: ship_point_from?.stc_description,
                    ship_point_to_name: ship_point_to?.stc_description,
                    principal_name: principal_tbl?.principal_name
                }
            })
        })

        const details = await getRevenueLeakDetails({
            filters:{
                ['$invoices_rev_leak.draft_bill_type$']: contract_type, 
                ['$invoices_cleared.location$']:location,
                ['$invoices_cleared.rdd$']:{
                    [sequelize.Op.between]:[from,to]
                }
            }
        })

       // console.log(details)

        const buffer = await generateExcel({
            invoices:data,
            details
        })

        return buffer
        
    } 
    catch (error) {
        throw error
    }
}

exports.generateTransmittalResult = async({
    errors,
    success,
    data
})=>{
    try{

        const wb = xlsx.utils.book_new();
 
        let error_details = []
        let error_header = []
        Object.keys(errors).map(item => {
            const details = errors[item].DETAILS

            details.map(item => {
                Object.keys(item).map(key => {
                    item[key].map(data => {
                        error_details.push({
                            ...data
                        })
                    })
                })
            })
        })

        // console.log()
        errors.map(item => {
            item.HEADER.map(item => {
                error_header.push({
                    ...item
                })
            })
        })

        const successWs = xlsx.utils.json_to_sheet(success)
        xlsx.utils.book_append_sheet(wb,successWs,'success');
     
        const errorDetails = xlsx.utils.json_to_sheet(error_details)
        xlsx.utils.book_append_sheet(wb,errorDetails,'error_details');

        const errorHeader = xlsx.utils.json_to_sheet(error_header)
        xlsx.utils.book_append_sheet(wb,errorHeader,'error_header');


        const transmittalData = xlsx.utils.json_to_sheet(data)
        xlsx.utils.book_append_sheet(wb,transmittalData,'data');

        return buf = xlsx.write(wb,{
            type:'buffer', bookType:"xlsx"
        })

    }
    catch(e){
        throw e
    }
}

exports.exportLocation = async()=>{
    try{
        const locations = await getAllLocation({
            filters:{}
        })

        const buffer = await generateExcel({
            locations
        })

        return buffer

    }
    catch(e){
        throw e
    }
}

exports.exportPrincipal = async()=>{
    try{
        const principals = await getAllPrincipal({filters:{}})
        const buffer = await generateExcel({
            principals
        })

        return buffer
    }
    catch(e){
        throw e
    }
}

exports.exportShipPoint = async()=>{
    try{
        const ship_points = await getAllShipPoint({filters:{}})
        const buffer = await generateExcel({
            ship_points
        })

        return buffer
    }
    catch(e){
        throw e
    }
}

exports.exportVendors = async()=>{
    try{
        const vendors           = await getAllVendor({})
        const vendor_group      = await getAllVendorGroup({})
        const vendor_group_dtl  = await getAllVendorGroupDtl({})

        const buffer = await generateExcel({
            vendors,
            vendor_group,
            vendor_group_dtl
        })

        return buffer
    }   
    catch(e){
        throw e
    }
}


exports.exportContractTariff = async({
    contract_id,
    from,
    to
}) => {
    try{
        const contract_details = await getContractDetails({
            filters:{
                contract_id,
                valid_from:{
                    [sequelize.Op.gte]: from
                },
                valid_to:{
                    [sequelize.Op.lte]: to
                }
            }
        })
        .then(result => {
            return result.map(item => {
                return {
                    ...item,
                    tariff_rate: _.round(item.tariff_rate,2).toFixed(2)
                }
            })
        })
       
        const buffer = await generateExcel({contract_details})

        return buffer
    }
    catch(e){
        throw e
    }
}

exports.exportQuickCode = async()=>{
    try{

        const quick_code = await getAllQuickCodes({})

        const buffer = await generateExcel({
            quick_code
        })

        return buffer

    }
    catch(e){
        throw e
    }
}

exports.exportAlgo = async()=>{
    try{
        const conditions = await getAllAggCondition({})
        const aggregation = await getAllAggregation({})

        const buffer = await generateExcel({
            conditions,
            aggregation
        })

        return buffer
    }
    catch(e){
        throw e
    }
}

exports.exportWmsDraftbill = async({
    from,
    to,
}) => {
    try{
        
        const data = await wmsDraftBillService.getAllDraftBills({
            filters:{
                draft_bill_date: {
                    [sequelize.Op.between]:[from,to]
                }
            }
        })

        const buffer = await generateExcel({
            draft_bill: data
        })


        return buffer
        

    }
    catch(e){
        throw e
    }
}

exports.exportWmsRevenueLeak = async({
    from,
    to,
}) => {
    try{

        const data = await wmsRevenueLeakService.getAllRevenueLeak({
            filters:{
                transaction_date: {
                    [sequelize.Op.between]:[from,to]
                },
                is_draft_bill:0
            }
        })

        const buffer = await generateExcel({
            revenue_leak: data
        })

        return buffer


    }
    catch(e){
        throw e
    }
}


