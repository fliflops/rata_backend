const axios = require('axios').default;
const draftBill = require('../draftBill')
const dataMaster = require('../dataMaster')
const _ = require('lodash')

const api = axios.create({
    baseURL:process.env.ASCII_API,
    // timeout:1000,
    headers:{
        [`Accept`]:'application/json'
    }
})

exports.loginService = async() => {
   try{
        const username = process.env.ASCII_USER_NAME
        const password = process.env.ASCII_PASSWORD
        const apiKey = process.env.ASCII_API_KEY

        const token = await api.post('/login',{
            username,
            password,
            api_key:apiKey
        })
        .then(result => {
            return result.data.access_token
        })

        return token
    } 
    catch(e){
       throw e
    }
}

exports.getDraftBillBuy = async({
    rdd,
    location
}) => {
    try{

        const serviceTypes = await dataMaster.getServiceTypes();
        const header = await draftBill.getAllDraftBills({
            filters:{
                delivery_date:rdd,
                contract_type:'BUY',
                location
            }
        })

        const details = await draftBill.getAllInvoices({
            filters:{
                delivery_date:rdd
            }
        })

        const draftBills = await header.map(item => {
            const invoices = details.filter(inv => inv.draft_bill_no === item.draft_bill_no)
            const serviceType = _.find(serviceTypes,['service_type_code',item.service_type])
                
            const CONFIRMATION_RECEIPT_DETAIL = [{
                COMPANY_CODE:       '00001',
                CR_CODE:            item.draft_bill_no,
                ITEM_CODE:          serviceType?.ascii_item_code,
                LINE_NO:            1,
                SERVICE_TYPE_CODE:  serviceType?.ascii_service_type,
                PRINCIPAL_CODE:     item.ascii_principal_code,
                LOCATION_CODE:      item.ascii_loc_code,
                UM_CODE:            invoices[0].vehicle_type,
                QUANTITY:           1,
                UNIT_PRICE:         _.round(item.rate,2),
                EXTENDED_AMT:       _.round(item.total_charges,2)
            }] 
             
            return {
                COMPANY_CODE:   '00001',
                CR_CODE:        item.draft_bill_no,
                REF_CODE:       invoices[0].trip_plan,
                CR_DATE:        item.draft_bill_date,
                DATE_CONFIRMED: item.draft_bill_date,
                ITEM_TYPE:      'S',
                SUPPLIER_CODE:  item.ascii_vendor_code,
                DEPARTMENT_CODE:serviceType?.ascii_service_type,
                PARTICULAR:     invoices.map(i => i.invoice_no).join(','),
                REF_SI_NO:      'n/a',
                REF_CROSS:      item.contract_id,
                CR_AMT:         _.round(item.total_charges,2),
                CONFIRMATION_RECEIPT_DETAIL
            }
        })

        return draftBills
    }
    catch(e){
        throw e
    }
}

exports.getDraftBill = async({
    rdd,
    location
}) => {
    try{
        const serviceTypes = await dataMaster.getServiceTypes();
        const header = await draftBill.getAllDraftBills({
            filters:{
                delivery_date:rdd,
                location,
                contract_type:'SELL'
            }
        })

        const details = await draftBill.getAllInvoices({
            filters:{
                delivery_date:rdd
            }
        })

        const draftBills        = header.map(item => {
            const invoices      = details.filter(inv => inv.draft_bill_no === item.draft_bill_no)
            const serviceType   = _.find(serviceTypes,['service_type_code',item.service_type])
            const SO_AMT        =  _.round(item.total_charges,2)
            //parseFloat(item.total_charges).toFixed(2)

            let SALES_ORDER_DETAIL

            if(item.customer === '10005' && invoices[0].class_of_store === 'COLD'){
                SALES_ORDER_DETAIL=[{
                    COMPANY_CODE:   '00001',
                    SO_CODE:        item.draft_bill_no,
                    ITEM_CODE:      serviceType?.ascii_item_code,
                    LINE_NO:        1,
                    LOCATION_CODE:  item.ascii_loc_code,
                    UM_CODE:        invoices[0].service_type === '2003'? invoices[0].vehicle_type :invoices[0].min_billable_unit,
                    QUANTITY:       1,
                    UNIT_PRICE:     SO_AMT,//parseFloat(item.total_charges).toFixed(2),   
                    EXTENDED_AMT:   SO_AMT//parseFloat(item.total_charges).toFixed(2)                    
                }]
            }
            else{
                
                // const quantity = invoices[0].service_type === '2003' ? 1 :     
                // _.sumBy(invoices,(i)=>{
                //     if(String(invoices[0].min_billable_unit).toLowerCase() === 'cbm'){
                //         return parseFloat(i.actual_cbm)
                //     }
                //     if(String(invoices[0].min_billable_unit).toLowerCase() === 'weigth'){
                //         return parseFloat(i.actual_weight)
                //     }
                //     if(['CASE','PIECE'].includes( String(invoices[0].min_billable_unit).toUpperCase())){
                //         return parseFloat(i.actual_qty)
                //     }
                // })

                SALES_ORDER_DETAIL=[{
                    COMPANY_CODE:   '00001',
                    SO_CODE:        item.draft_bill_no,
                    ITEM_CODE:      serviceType?.ascii_item_code,
                    LINE_NO:        1,
                    LOCATION_CODE:  item.ascii_loc_code,
                    UM_CODE:        ['2003','2002'].includes(invoices[0].service_type) ? invoices[0].vehicle_type :invoices[0].min_billable_unit,
                    QUANTITY:       ['2003','2002'].includes(invoices[0].service_type) ? 1 :     
                    _.round(_.sumBy(invoices,(i)=>{
                        if(String(invoices[0].min_billable_unit).toLowerCase() === 'cbm'){
                            return parseFloat(i.actual_cbm)
                        }
                        if(String(invoices[0].min_billable_unit).toLowerCase() === 'weight'){
                            return parseFloat(i.actual_weight)
                        }
                        if(['CASE','PIECE'].includes( String(invoices[0].min_billable_unit).toUpperCase())){
                            return parseFloat(i.actual_qty)
                        }
                    }),2),
                    UNIT_PRICE:     _.round(item.rate,2),   
                    EXTENDED_AMT:   SO_AMT                    
                }] 
            }

            return {
                COMPANY_CODE:   '00001',
                SO_CODE:        item.draft_bill_no,
                ITEM_TYPE:      'S',
                SO_DATE:        item.draft_bill_date,
                CUSTOMER_CODE:  item.ascii_customer_code,
                PARTICULAR:     invoices.map(i => i.invoice_no).join(','),
                REF_EUPO:       invoices[0].trip_plan,
                REF_CROSS:      item.contract_id,
                SO_AMT,
                SALES_ORDER_DETAIL
            }

        })

        return draftBills
    }
    catch(e){
        throw e
    }
}


exports.getWMSDraftBill = async({
    data
})=>{
    try{
        const serviceTypes = await dataMaster.getServiceTypes();
        
        return data.map(header => {
            const service_type = _.find(serviceTypes,['service_type_code',header.service_type])
            const SO_AMT       = _.round(header.total_charges,2)
            const details = header.draft_bill_details
            let SALES_ORDER_DETAIL = [
                {
                    COMPANY_CODE:   '00001',
                    SO_CODE:        header.draft_bill_no,
                    ITEM_CODE:      service_type?.ascii_item_code,
                    LINE_NO:        1,
                    LOCATION_CODE:  header.ascii_loc_code,
                    UM_CODE:        details[0].service_type,
                    QUANTITY:       
                    _.round(_.sumBy(details,(i)=>{
                        if(String(details[0].min_billable_unit).toLowerCase() === 'cbm'){
                            return parseFloat(i.actual_cbm)
                        }

                        return parseFloat(i.actual_qty)

                    }),2),
                    UNIT_PRICE:     _.round(header.rate,2),   
                    EXTENDED_AMT:   SO_AMT
                }
            ];

            return {
                COMPANY_CODE:   '00001',
                SO_CODE:        header.draft_bill_no,
                ITEM_TYPE:      'S',
                SO_DATE:        header.draft_bill_date,
                CUSTOMER_CODE:  header.ascii_customer_code,
                PARTICULAR:     _.uniq(header.draft_bill_details.map(item => item.primary_ref_doc)),
                REF_EUPO:       '',//invoices[0].trip_plan,
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

exports.createAsciiSalesOrder = async({
    token,
    data
}) => {
    try{
        return await api.post(`/get/sales-order`,data,
        {
            headers:{
                ['Content-Type']: 'application/json',
                ['Authorization']: `Bearer ${token}`
            }
        })
        .then(result => {    

            return {
                errors:result.data.ERROR,
                success:result.data.SUMMARY
            }
        })
    }
    catch(e){
        throw e
    }
}   

exports.createAsciiConfirmationReceipt = async({
    token,
    data
}) => {
    try{
        return await api.post(`/get/confirm-receipt`,data,{
            headers:{
                ['Content-Type']: 'application/json',
                ['Authorization']: `Bearer ${token}`
            }
        })
        .then(result => {            
           
            return {
                errors:result.data.ERROR,
                success:result.data.SUMMARY
            }
        })

    }
    catch(e){
        throw e
    }
}
