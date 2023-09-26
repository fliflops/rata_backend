const models = require('../models/rata');
const _ = require('lodash');
const axios = require('axios').default;
const asciiService = require('../services/asciiService');
const fs = require('fs');

const api = axios.create({
    baseURL:process.env.ASCII_API,
    // timeout:1000,
    headers:{
        [`Accept`]:'application/json'
    }
})

const login = async() => {
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

exports.warehouseController = async (req,res,next) => {
    try{
        const {date} = req.query;
        let result;
        const token = await login();
        const data = await models.wms_draft_bill_hdr_tbl.getData({
            options:{
                include:[
                    {
                        model:models.wms_draft_bill_dtl_tbl,
                        as:'details'
                    },
                    {
                        model: models.principal_tbl
                    },
                    {
                        model: models.service_type_tbl
                    },
                    {
                        model: models.location_tbl
                    }
                ]
            },
            where:{
                draft_bill_date: date,
                status:'DRAFT_BILL'
            }
        })

        const asciiData = await data.map(item => {
            const {principal_tbl,service_type_tbl,location_tbl} = item
            let SALES_ORDER_DETAIL;
            const SO_AMT = _.round(item.total_charges,2)

            SALES_ORDER_DETAIL = [
                {
                    COMPANY_CODE:'00001',
                    SO_CODE: item.draft_bill_no,
                    ITEM_CODE: item.service_type_tbl.ascii_item_code,
                    LINE_NO: 1,
                    LOCATION_CODE: location_tbl?.ascii_loc_code || 'N/A',
                    UM_CODE: item.details[0].min_billable_unit,
                    QUANTITY: 1,
                    UNIT_PRICE:     SO_AMT,
                    EXTENDED_AMT:   SO_AMT
                }
            ]
            
            return {
                COMPANY_CODE:   '00001',
                SO_CODE:        item.draft_bill_no,
                ITEM_TYPE:      'S',
                SO_DATE:        item.draft_bill_date,
                CUSTOMER_CODE:  principal_tbl?.ascii_customer_code || 'N/A',
                PARTICULAR:     item.draft_bill_no,  
                REF_EUPO:       item.draft_bill_no,
                REF_CROSS:      item.contract_id,
                SO_AMT:         SO_AMT,
                SALES_ORDER_DETAIL
            }
        })

        await api.post('/get/sales-order',JSON.parse(JSON.stringify(asciiData)),{
            headers:{
                ['Content-Type']: 'application/json',
                ['Authorization']: `Bearer ${token}`
            }
        })
        .then(res => {    

            result = {
                errors:res.data.ERROR,
                success:res.data.SUMMARY
            }

            return {
                errors:res.data.ERROR,
                success:res.data.SUMMARY
            }
        })

        await models.wms_draft_bill_hdr_tbl.updateData({
            data:{
                status:'DRAFT_BILL_POSTED'
            },
            filters:{
                draft_bill_no: result.success.map(item => item.SO_CODE)
            }
        })

        const xlsx = await asciiService.generateResult({
            success:result.success,
            errors:result.errors,
            data: asciiData
        })

        res.set('Content-disposition',`ascii_warehouse_result.xlsx`);
        res.set('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');    
        res.send(xlsx)
    }   
    catch(e){
        next(e)
    }
}   

exports.transportController = async(req,res,next) => {
    try{
        const {date,location,type} = req.query;
        let data;
        let result;
        const token = await login();
        
        const draftBill = await models.draft_bill_hdr_tbl.getData({
            options:{
                include:[
                    {
                        model: models.location_tbl,
                        attributes:['ascii_loc_code'],
                        required:false
                        
                    },
                    {
                        model:models.vendor_tbl,
                        attributes:['ascii_vendor_code'],
                        required:false
                    },
                    {
                        model: models.principal_tbl,
                        attributes:['ascii_principal_code','ascii_customer_code'],
                        required: false
                    },
                    {
                        model: models.service_type_tbl,
                        attributes:['ascii_service_type','ascii_item_code']
                    },
                    {
                        model: models.draft_bill_details_tbl,
                        as:'details'
                    },
                    // {
                    //     model: models.tariff_sell_hdr_tbl,
                    //     as:'tariff'
                    // }
                ]
            },
            where:{
                delivery_date: date,
                location: location,
                contract_type: type,
                status:'DRAFT_BILL'
            }
        })
        .then(result => {
            return result.map(item => {
                const {location_tbl,vendor_tbl,principal_tbl,service_type_tbl,...newItem} = item

                return {
                    ...newItem,
                    ascii_service_type: service_type_tbl?.ascii_service_type || null,
                    ascii_item_code:    service_type_tbl?.ascii_item_code || null,
                    ascii_vendor_code:      typeof  vendor_tbl?.ascii_vendor_code === 'undefined' ? null: vendor_tbl?.ascii_vendor_code,
                    ascii_loc_code:         typeof location_tbl?.ascii_loc_code === 'undefined' ? null :location_tbl?.ascii_loc_code, 
                    ascii_principal_code:   typeof principal_tbl?.ascii_principal_code === 'undefined' ? null : principal_tbl?.ascii_principal_code,
                    ascii_customer_code:    typeof principal_tbl?.ascii_customer_code === 'undefined' ? null : principal_tbl?.ascii_customer_code
                }
            })

        })

        if(type === 'SELL'){
            data = await asciiService.asciiSalesOrder(draftBill)
            await api.post('/get/sales-order',JSON.parse(JSON.stringify(data)),{
                headers:{
                    ['Content-Type']: 'application/json',
                    ['Authorization']: `Bearer ${token}`
                }
            })
            .then(res => {    

                result = {
                    errors:res.data?.ERROR || [],
                    success:res.data?.SUMMARY || []
                }

                return {
                    errors:res.data.ERROR,
                    success:res.data.SUMMARY
                }
            })

            await models.draft_bill_hdr_tbl.updateData({
                data:{
                    status:'DRAFT_BILL_POSTED'
                },
                where:{
                    draft_bill_no: result.success.map(item => item.SO_CODE)
                }
            })
        }
        else {
            data = await asciiService.asciiConfirmationReceipt(draftBill)

            await api.post('/get/confirm-receipt',JSON.parse(JSON.stringify(data)),{
                headers:{
                    ['Content-Type']: 'application/json',
                    ['Authorization']: `Bearer ${token}`
                }
            })
            .then(res => {    
        
                result = {
                    errors:res.data?.ERROR || [],
                    success:res.data?.SUMMARY || []
                }

                return {
                    errors:res.data.ERROR,
                    success:res.data.SUMMARY
                }
            })

            await models.draft_bill_hdr_tbl.updateData({
                data:{
                    status:'DRAFT_BILL_POSTED'
                },
                where:{
                    draft_bill_no:result.success.map(item => item.CR_CODE),
                }
            })
        }

        const xlsx = await asciiService.generateResult({
            success:result.success,
            errors:result.errors,
            data
        })

        res.set('Content-disposition',`ascii_transport_${type}_result.xlsx`);
        res.set('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');    
        res.send(xlsx)
    }   
    catch(e){
        next(e)
    }
}

exports.getSo = async (req,res,next) => {
    try{
        const {date,location,type} = req.query;

        const draftBill = await models.draft_bill_hdr_tbl.getData({
            options:{
                include:[
                    {
                        model: models.location_tbl,
                        attributes:['ascii_loc_code'],
                        required:false
                        
                    },
                    {
                        model:models.vendor_tbl,
                        attributes:['ascii_vendor_code'],
                        required:false
                    },
                    {
                        model: models.principal_tbl,
                        attributes:['ascii_principal_code','ascii_customer_code'],
                        required: false
                    },
                    {
                        model: models.service_type_tbl,
                        attributes:['ascii_service_type','ascii_item_code']
                    },
                    {
                        model: models.draft_bill_details_tbl,
                        as:'details'
                    }
                ]
            },
            where:{
                delivery_date: date,
                location: location,
                contract_type: type,
                status:'DRAFT_BILL'
            }
        })
        .then(result => {
            return result.map(item => {
                const {location_tbl,vendor_tbl,principal_tbl,service_type_tbl,...newItem} = item
    
                return {
                    ...newItem,
                    ascii_service_type: service_type_tbl?.ascii_service_type || null,
                    ascii_item_code:    service_type_tbl?.ascii_item_code || null,
                    ascii_vendor_code:      typeof  vendor_tbl?.ascii_vendor_code === 'undefined' ? null: vendor_tbl?.ascii_vendor_code,
                    ascii_loc_code:         typeof location_tbl?.ascii_loc_code === 'undefined' ? null :location_tbl?.ascii_loc_code, 
                    ascii_principal_code:   typeof principal_tbl?.ascii_principal_code === 'undefined' ? null : principal_tbl?.ascii_principal_code,
                    ascii_customer_code:    typeof principal_tbl?.ascii_customer_code === 'undefined' ? null : principal_tbl?.ascii_customer_code
                }
            })
    
        })

        const data = await asciiService.asciiSalesOrder(draftBill);

        res.json(data)
    }
    catch(e){
        next(e)
    }
    
   
}


 
