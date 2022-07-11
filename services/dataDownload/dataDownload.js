const {getAllDraftBills, getAllInvoices} = require('../draftBill');
const {getAllRevenueLeak} = require('../invoice');
const {getAllLocation} = require('../location');
const {getAllPrincipal} = require('../principal');
const {getAllShipPoint} = require('../shipPoint');
const {getAllVendor,getAllVendorGroup,getAllVendorGroupDtl} = require('../vendor');
const xlsx = require('xlsx');
const sequelize = require('sequelize')

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

        const buffer = await generateExcel({
            invoices:data
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
        const vendors = await getAllVendor({})
        const vendor_group = await getAllVendorGroup({})
        const vendor_group_dtl = await getAllVendorGroupDtl({})

        const buffer = await generateExcel({
            vendors,
            vendor_group,
            vendor_group_dtl
        })

        return buffer
    }   
    catch(e){

    }
}




