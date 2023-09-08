const _ = require('lodash')
const xlsx = require('xlsx');

exports.asciiSalesOrder = async (data) => {
    try{
        return data.map(header => {
            let SALES_ORDER_DETAIL;
            const details = header.details
            const SO_AMT  =  _.round(header.total_charges,2)

            if(header.customer === '10005' && details[0].class_of_store === 'COLD') {
                SALES_ORDER_DETAIL=[
                        {
                            COMPANY_CODE:   '00001',
                            SO_CODE:        header.draft_bill_no,
                            ITEM_CODE:      header.ascii_item_code,
                            LINE_NO:        1,
                            LOCATION_CODE:  header.ascii_loc_code,
                            UM_CODE:        ['2002','2003','2004','2008'].includes(details[0].service_type) ? 'lot' //details[0].vehicle_type
                                : details[0].min_billable_unit,
                            QUANTITY:       1,
                            UNIT_PRICE:     SO_AMT,   
                            EXTENDED_AMT:   SO_AMT                    
                        }
                    ]
                }
            else{

                SALES_ORDER_DETAIL=[{
                    COMPANY_CODE:   '00001',
                    SO_CODE:        header.draft_bill_no,
                    ITEM_CODE:      header.ascii_item_code,
                    LINE_NO:        1,
                    LOCATION_CODE:  header.ascii_loc_code,
                    UM_CODE:        ['2002','2003','2004','2008'].includes(details[0].service_type) ? 'lot' : details[0].min_billable_unit,
                    QUANTITY:       ['2002','2003','2004','2008'].includes(details[0].service_type) ? 1 :     
                    _.round(_.sumBy(details,(i)=>{
                        if(String(details[0].min_billable_unit).toLowerCase() === 'cbm'){
                            return parseFloat(i.actual_cbm)
                        }
                        if(String(details[0].min_billable_unit).toLowerCase() === 'weight'){
                            return parseFloat(i.actual_weight)
                        }
                        if(['CASE','PIECE'].includes( String(details[0].min_billable_unit).toUpperCase())){
                            return parseFloat(i.actual_qty)
                        }
                    }),2),
                    UNIT_PRICE:     _.round(header.rate,2),   
                    EXTENDED_AMT:   SO_AMT                    
                }]

            }

            return {
                COMPANY_CODE:   '00001',
                SO_CODE:        header.draft_bill_no,
                ITEM_TYPE:      'S',
                SO_DATE:        header.draft_bill_date,
                CUSTOMER_CODE:  header.ascii_customer_code,
                PARTICULAR:     details.map(i => i.invoice_no).join(','),
                REF_EUPO:       details[0].trip_plan,
                REF_CROSS:      header.contract_id,
                SO_AMT,
                SALES_ORDER_DETAIL
            }
        })

    }
    catch(e){
        throw e
    }
}

exports.asciiConfirmationReceipt = async(data) => {
    try{

        return data.map(header => {
            const details = header.details

            const CONFIRMATION_RECEIPT_DETAIL = [{
                COMPANY_CODE:       '00001',
                CR_CODE:            header.draft_bill_no,
                ITEM_CODE:          header.ascii_item_code,
                LINE_NO:            1,
                SERVICE_TYPE_CODE:  header.ascii_service_type,
                PRINCIPAL_CODE:     header.ascii_principal_code,
                LOCATION_CODE:      header.ascii_loc_code,
                UM_CODE:            details[0].vehicle_type,
                QUANTITY:           1,
                UNIT_PRICE:         _.round(header.total_charges,2),
                EXTENDED_AMT:       _.round(header.total_charges,2)
            }]

            return {
                COMPANY_CODE:       '00001',
                CR_CODE:            header.draft_bill_no,
                REF_CODE:           details[0].trip_plan,
                CR_DATE:            header.draft_bill_date,
                DATE_CONFIRMED:     header.draft_bill_date,
                ITEM_TYPE:          'S',
                SUPPLIER_CODE:      header.ascii_vendor_code,
                DEPARTMENT_CODE:    header.ascii_service_type,
                PARTICULAR:         details.map(i => i.invoice_no).join(','),
                REF_SI_NO:          'n/a',
                REF_CROSS:          header.contract_id,
                CR_AMT:             _.round(header.total_charges,2),
                CONFIRMATION_RECEIPT_DETAIL
            }
        })

    }
    catch(e){
        throw e
    }
}

exports.generateResult = async({
    errors,
    success,
    data
}) => {
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
        console.log(e)
        throw e
    }
}