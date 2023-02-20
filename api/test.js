const router         = require('express').Router();
const wmsService    = require('../services/wms')
const {wmsRevenueLeakService,wmsRevenueLeak}            =require('../services/wms-revenueLeak')

const models = require('../src/models/rata')
const {sequelize} = models;
 
router.get('/wms',async(req,res,next) => {

    const {date} = req.query;

    const {header,details} = await wmsService.getWMSData({
        date:date
    })

    await sequelize.transaction(async t => {
        try{
            await models.wms_data_header_tbl.bulkCreateData({
                data:header.map(item => {
                    return {
                        ...item,
                        //job_id: job.id
                    }
                }),
                options:{
                    transaction:t,
                    ignoreDuplicates:true,
                    logging:false
                }
            })

            await models.wms_data_details_tbl.bulkCreateData({
                data:details,
                options:{
                    transaction:t,
                    ignoreDuplicates:true,
                    logging:false
                }
            })    

        }
        catch(e){
            throw e
        }
    })

    res.status(200).end()

})

router.post('/revenue-leak/wms', async(req,res,next)=> {
    try{
        const {date} = req.query;

        const revenueLeaks = await wmsRevenueLeakService.getAllRevenueLeak({
            filters:{
                transaction_date: date,
                is_draft_bill:0
            }
        }) 

        const data = await wmsRevenueLeak({
            rev_leak_data:revenueLeaks,
            transaction_date: date
        })

        res.status(200).json({
            data : {
                revenue_leaks:revenueLeaks,
                wms_data: data.wms_reference_no,
                wms_revenue_leak: data.revenue_leak
            }  
        })

    }
    catch(e){
        console.log(e)
        res.status(500).json({message:`${e}`})
    }
})

module.exports = router;


// const wmsService = require('../services/wms');
// const wmsDraftBill = require('../services/wms-draftbill');
// const transportDraftBill = require('../src/services/draftbillService')
// const models = require('../src/models/rata');

// const {sequelize,Sequelize} = models;

// const moment = require('moment');

// const {Op}                  = Sequelize;
// const {dataLayer,service}   = wmsDraftBill;

// const asciiService = require('../services/ascii');
// const draftBill = require('../services/draftBill');
// const dataMaster = require('../services/dataMaster');

// const _ = require('lodash')

// const {redis} = require('../config')



// // router.post('/redis', async(req,res,next)=>{
// //     // await Promise.all([
// //     //     redis.json.set('noderedis:users:1', '$', {
// //     //       name: 'Alice',
// //     //       age: 32,
// //     //       coins: 100,
// //     //       email: 'alice@nonexist.com'
// //     //     }),
// //     //     redis.json.set('noderedis:users:2', '$', {
// //     //       name: 'Bob',
// //     //       age: 23,
// //     //       coins: 15,
// //     //       email: 'bob@somewhere.gov'
// //     //     })
// //     //   ]);

// //     await redis.json.set('noderedis:users:3', '$', {
// //         name:'Vincent',
// //         age:25,
// //         coins:500,
// //         email: 'vincent.lindayag@kerrylogistikus.com'
// //     })

// //     res.status(200).end()
// // })

// // router.get('/redis', async(req,res,next)=>{
   
// //     const emailAddress = 'admin@cdi.com'.replace(/[.@\\]/g, '\\$&');
// //     console.log(emailAddress)
// //     const result = 
// //     await redis.ft.search('idx:ratasession', `@email:{${emailAddress}}`) 
// //     //await redis.ft.search('idx:users', `@email:{${emailAddress}`)
// //     // await redis.ft.search('idx:ratasession', `@email:{${emailAddress}})`)
    
// //     res.status(200).json(result)
// // })


// router.get('/ascii', async(req,res,next) => {
//     try{
//         const {rdd,location} = req.query

//         //const token = await login();
//         const serviceTypes = await dataMaster.getServiceTypes();
//         const header = await draftBill.getAllDraftBills({
//             filters:{
//                 delivery_date:rdd,
//                 location,
//                 contract_type:'SELL'
//             }
//         })

//         const details = await draftBill.getAllInvoices({
//             filters:{
//                 delivery_date:rdd
//             }
//         })

//         const draftBills        = header.map(item => {
//             const invoices      = details.filter(inv => inv.draft_bill_no === item.draft_bill_no)
//             const serviceType   = _.find(serviceTypes,['service_type_code',item.service_type])
//             const SO_AMT        =  _.round(item.total_charges,2)
            
//             let SALES_ORDER_DETAIL

//             if(item.customer === '10005' && invoices[0].class_of_store === 'COLD'){
//                 SALES_ORDER_DETAIL=[{
//                     COMPANY_CODE:   '00001',
//                     SO_CODE:        item.draft_bill_no,
//                     ITEM_CODE:      serviceType?.ascii_item_code,
//                     LINE_NO:        1,
//                     LOCATION_CODE:  item.ascii_loc_code,
//                     UM_CODE:        invoices[0].service_type === '2003'? item.vehicle_type :invoices[0].min_billable_unit,
//                     QUANTITY:       1,
//                     UNIT_PRICE:     SO_AMT,//parseFloat(item.total_charges).toFixed(2),   
//                     EXTENDED_AMT:   SO_AMT//parseFloat(item.total_charges).toFixed(2)                    
//                 }]
//             }
//             else{
            
//                 SALES_ORDER_DETAIL=[{
//                     COMPANY_CODE:   '00001',
//                     SO_CODE:        item.draft_bill_no,
//                     ITEM_CODE:      serviceType?.ascii_item_code,
//                     LINE_NO:        1,
//                     LOCATION_CODE:  item.ascii_loc_code,
//                     UM_CODE:        ['2002','2003'].includes(invoices[0].service_type)? invoices[0].vehicle_type :invoices[0].min_billable_unit,
//                     QUANTITY:       ['2002','2003'].includes(invoices[0].service_type)? 1 :     
//                     _.round(_.sumBy(invoices,(i)=>{
//                         if(String(invoices[0].min_billable_unit).toLowerCase() === 'cbm'){
//                             return parseFloat(i.actual_cbm)
//                         }
//                         if(String(invoices[0].min_billable_unit).toLowerCase() === 'weight'){
//                             return parseFloat(i.actual_weight)
//                         }
//                         if(['CASE','PIECE'].includes( String(invoices[0].min_billable_unit).toUpperCase())){
//                             return parseFloat(i.actual_qty)
//                         }
//                     }),2),
//                     UNIT_PRICE:     _.round(item.rate,2),   
//                     EXTENDED_AMT:   SO_AMT                    
//                 }] 
//             }

//             return {
//                 COMPANY_CODE:   '00001',
//                 SO_CODE:        item.draft_bill_no,
//                 ITEM_TYPE:      'S',
//                 SO_DATE:        item.draft_bill_date,
//                 CUSTOMER_CODE:  item.ascii_customer_code,
//                 PARTICULAR:     invoices.map(i => i.invoice_no).join(','),
//                 REF_EUPO:       invoices[0].trip_plan,
//                 REF_CROSS:      item.contract_id,
//                 SO_AMT,
//                 SALES_ORDER_DETAIL
//             }

//         })

//         res.json({
//             draftBills,
//             header
//         })

//     }
//     catch(e){
//         next(e)
//     }
// })


// router.get('/wms',async(req,res) => {
//     try{
//         const {date} = req.query;

//         const data = await wmsService.getWMSData({
//             date
//         })
        
//         res.status(200).json(data)
//     }
//     catch(e){
//         next(e)
//     }
   

//     // res.status(200).json({draftBill})
// })

// router.post('/wms',async(req,res)=>{
//     const {date} = req.query;

//     const {header,details} = await wmsService.getWMSData({
//         date
//     })

//     await sequelize.transaction(async t => {
//         await models.wms_data_header_tbl.bulkCreateData({
//             data:header,
//             options:{
//                 transaction:t,
//                 ignoreDuplicates:true
//             }
//         })

//         await models.wms_data_details_tbl.bulkCreateData({
//             data:details,
//             options:{
//                 transaction:t,
//                 ignoreDuplicates:true
//             }
//         })

//     })

//     res.status(200).json({
//         header,
//         details,
//         details_count: details.length,
//         header_count: header.length 
//     })
// })

// router.post('/wms/draft-bill', async(req,res,next) => {
//     try{

//         const {date} = req.query;

//         const wms_data = await models.wms_data_header_tbl.getData({
//             where:{
//                 is_processed: 0,
//                 transaction_date: date
//             },
//             options:{
//                 include:[
//                     {
//                         model:models.wms_data_details_tbl,
//                         as:'details'
//                     }
//                 ]
//             }
//         })

//         const draft_bill = await wmsDraftBill.generateDraftBill({
//             wms_data,
//             transaction_date: date,
//             job_id:null
//         })


//         res.send(draft_bill)
//     }
//     catch(e){
//         next(e)
//     }
// })

// router.get('/tms', async(req,res) => {
//     const {rdd} = req.query;
//     const data = await models.helios_invoices_hdr_tbl.getData({
//         options:{
//             include:[
//                 {
//                     model: models.ship_point_tbl,
//                     attributes:['city','region'],
//                     as:'ship_point_to'
//                 }
//             ]
//         },
//         where:{
//             rdd,
//             location:'Zeus',
//             vehicle_type:'L300CV',
//             trucker_id:'02220',
//             is_processed_buy: 0
//         }
//     })  

//     res.json(data)
// })

// router.post('/pod',async(req,res)=>{
//     try{
//         const {rdd} = req.query;

//         const invoice = await heliosService.bookings.getBookingRequest({
//             rdd
//         })

//         await sequelize.transaction(async t => {
//             await models.helios_invoices_hdr_tbl.bulkCreateData({
//                 data:invoice.header,
//                 options:{
//                     transaction:t,
//                     updateOnDuplicate: ['updatedAt','vehicle_type','vehicle_id','trip_no'],
//                     logging:false
//                 }
//             })

//             await models.helios_invoices_dtl_tbl.bulkCreateData({
//                 data:invoice.details,
//                 options:{
//                     transaction:t,
//                     ignoreDuplicates:true,
//                     logging: false
//                 }
//             })
//         })

//         res.status(200).json(invoice)
//     }
//     catch(e){
//         throw e
//     }
// })

// router.post('/pod/draft-bill', async(req,res) => {
//     const {rdd} = req.query;

//     const invoices = await (models.helios_invoices_hdr_tbl.getData({
//         where:{
//             rdd,
//             is_processed_buy: 0
//         },
//         options:{
//             include:[
//                 {model: models.ship_point_tbl, as:'ship_point_from'},
//                 {model: models.ship_point_tbl, as:'ship_point_to'},
//                 {model: models.helios_invoices_dtl_tbl},
//                 {model: models.vendor_tbl},
//                 {
//                     model: models.vendor_group_dtl_tbl,
//                     required: false,
//                     where:Sequelize.where(Sequelize.col('vendor_group_dtl_tbl.location'),Sequelize.col('helios_invoices_hdr_tbl.location'))
//                 },
//             ]
//         }
//     }))
//     .then(result => {
//         return result.map(item => {
//             const {
//                 vendor_tbl,
//                 vendor_group_dtl_tbl,
//                 ...invoice
//             } = item;

//             return {
//                 ...invoice,
//                 vg_code:vendor_group_dtl_tbl?.vg_code || null,
//                 is_ic: vendor_tbl?.is_ic || 0
//             }
//         })
//     })

//     const {data,revenue_leak} = await transportDraftBill.buy({
//         invoices,
//         rdd
//     })


//     res.status(200).json({
//         data,
//         revenue_leak
//     })
   
// })

// router.get('/contracts', async(req,res) => {
//     const {rdd} = req.query
//     const algo = await models.agg_tbl.getData({
//         where:{
//             id: 'SecXdock-CBM-WAgg-WMgv-WGrp'
//         },
//         options:{
//             include:[
//                 {
//                     model:models.agg_conditions_tbl,
//                     required: false
//                 }
//             ]
//         }
//     })

//     const conditions = await models.agg_conditions_tbl.findAll({
//         where:{
//             agg_id:'SecXdock-CBM-WAgg-WMgv-WGrp'
//         }
//     })
//     // const contracts = await models.contract_hdr_tbl.getContracts({
//     //     where:{
//     //         contract_type:'SELL',
//     //         contract_id: 'PNG',
//     //         contract_status:'APPROVED',
//     //         valid_from: {
//     //             [Op.lte]: rdd
//     //         },
//     //         valid_to:{
//     //             [Op.gte]: rdd
//     //         }
//     //     },
//     //     options:{
//     //         include:[
//     //             {
//     //                 model:models.contract_tariff_dtl,
//     //                 include:[
//     //                     {
//     //                        model: models.tariff_sell_hdr_tbl,
//     //                     },
//     //                     {
//     //                         model:models.agg_tbl,
//     //                         required:false,
//     //                         include:[
//     //                             {
//     //                                 model:models.agg_conditions_tbl,
//     //                                 required: false
//     //                             }
//     //                         ],
//     //                         //include:models.agg_conditions_tbl,
//     //                     },
//     //                     // {
//     //                     //     model:models.agg_conditions_tbl,
//     //                     // },
//     //                     {
//     //                         model: models.tariff_ic_algo_tbl,
//     //                         required:false,
//     //                     }
//     //                 ],
//     //                 required:false,
//     //                 where:{
//     //                     status:'ACTIVE',
//     //                     valid_from: {
//     //                         [Op.lte]: rdd
//     //                     },
//     //                     valid_to:{
//     //                         [Op.gte]: rdd
//     //                     }
//     //                 },
               
//     //             },
//     //         ]
//     //     },
//     // })

//     res.status(200).json({
//         //contracts
//         algo,
//         conditions
//     })
// })

// module.exports = router 