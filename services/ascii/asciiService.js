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
    rdd
}) => {
    try{

        const serviceTypes = await dataMaster.getServiceTypes();
        const header = await draftBill.getAllDraftBills({
            filters:{
                delivery_date:rdd,
                contract_type:'BUY'
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
                
            const CONFIRMATION_RECEIPT_DETAIL = invoices.map((inv,index)=>{
                let quantity = 0
                return {
                    COMPANY_CODE:       '00001',
                    CR_CODE:            inv.trip_plan,
                    ITEM_CODE:          serviceType?.ascii_item_code,
                    LINE_NO:            index+1,
                    SERVICE_TYPE_CODE:  serviceType?.ascii_service_type,
                    PRINCIPAL_CODE:     item.customer,
                    LOCATION_CODE:      item.ascii_loc_code,
                    UM_CODE:            inv.vehicle_type,
                    QUANTITY:           1,
                    UNIT_PRICE:         parseFloat(inv.billing).toFixed(2),
                    EXTENDED_AMT:       parseFloat(inv.billing).toFixed(2)
                }
            })

            return {
                COMPANY_CODE:   '00001',
                CR_CODE:        invoices[0].trip_plan,
                REF_CODE:       invoices[0].trip_plan,
                CR_DATE:        item.draft_bill_date,
                DATE_CONFIRMED: item.draft_bill_date,
                ITEM_TYPE:      'S',
                SUPPLIER_CODE:  item.vendor,
                DEPARTMENT_CODE:serviceType?.ascii_service_type,
                PARTICULAR:     '',
                REF_SI_NO:      null,
                REF_CROSS:      item.contract_id,
                CR_AMT:         parseFloat(item.total_charges).toFixed(2),
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
    rdd
}) => {
    try{
        const serviceTypes = await dataMaster.getServiceTypes();
        const header = await draftBill.getAllDraftBills({
            filters:{
                delivery_date:rdd,
                contract_type:'SELL'
            }
        })

        const details = await draftBill.getAllInvoices({
            filters:{
                delivery_date:rdd
            }
        })

        const draftBills = header.map(item => {
            const invoices = details.filter(inv => inv.draft_bill_no === item.draft_bill_no)
            const serviceType = _.find(serviceTypes,['service_type_code',item.service_type])
            
            const SALES_ORDER_DETAIL = invoices.map((inv,index) => {
                let quantity = 0

                if(inv.service_type === '2003'){
                    quantity = 1
                }
                else {
                    if(String(inv.min_billable_unit).toLowerCase() === 'cbm'){
                        quantity = inv.actual_cbm
                        //console.log(inv.actual_cbm)
                    }
                    if(String(inv.min_billable_unit).toLowerCase() === 'weigth'){
                        quantity = inv.actual_weight
                    }
                    if(['CASE','PIECE'].includes( String(inv.min_billable_unit).toUpperCase())){
                        quantity=inv.actual_qty
                    }

                }

                return {
                    COMPANY_CODE:   '00001',
                    SO_CODE:        inv.draft_bill_no,
                    ITEM_CODE:      serviceType?.ascii_service_type,
                    LINE_NO:        index+1,
                    LOCATION_CODE:  item.ascii_loc_code,
                    UM_CODE:        inv.service_type === '2003'? inv.vehicle_type :inv.min_billable_unit,
                    QUANTITY:       quantity ? parseFloat(quantity).toFixed(2) : 0,  
                    UNIT_PRICE:     parseFloat(inv.billing).toFixed(2),
                    EXTENDED_AMT:   parseFloat(inv.billing).toFixed(2)
                    //parseFloat(item.total_charges).toFixed(2)
                }
            })


            return {
                COMPANY_CODE:   '00001',
                SO_CODE:        item.draft_bill_no,
                ITEM_TYPE:      'S',
                SO_DATE:        item.draft_bill_date,
                CUSTOMER_CODE:  item.customer,
                PARTICULAR:     null,
                REF_EUPO:       invoices[0].trip_plan,
                REF_CROSS:      item.contract_id,
                SO_AMT:         parseFloat(item.total_charges).toFixed(2),
                SALES_ORDER_DETAIL
            }

        })

        return draftBills
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

    }
    catch(e){
        throw e
    }
}