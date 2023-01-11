const router         = require('express').Router();
const heliosService = require('../services/Helios');
const wmsService = require('../services/wms');
const wmsDraftBill = require('../services/wms-draftbill');
const transportDraftBill = require('../src/services/draftbillService')
const models = require('../src/models/rata');

const {sequelize,Sequelize} = models;

const moment = require('moment');

const {Op}                  = Sequelize;
const {dataLayer,service}   = wmsDraftBill;



router.get('/wms',async(req,res) => {
    try{
        const {date} = req.query;

        const data = await wmsService.getWMSData({
            date
        })
        
        res.status(200).json(data)
    }
    catch(e){
        next(e)
    }
   

    // res.status(200).json({draftBill})
})

router.post('/wms',async(req,res)=>{
    const {date} = req.query;

    const {header,details} = await wmsService.getWMSData({
        date
    })

    await sequelize.transaction(async t => {
        await models.wms_data_header_tbl.bulkCreateData({
            data:header,
            options:{
                transaction:t,
                ignoreDuplicates:true
            }
        })

        await models.wms_data_details_tbl.bulkCreateData({
            data:details,
            options:{
                transaction:t,
                ignoreDuplicates:true
            }
        })

    })

    res.status(200).json({
        header,
        details,
        details_count: details.length,
        header_count: header.length 
    })
})

router.post('/wms/draft-bill', async(req,res,next) => {
    try{

        const {date} = req.query;

        const wms_data = await models.wms_data_header_tbl.getData({
            where:{
                is_processed: 0,
                transaction_date: date
            },
            options:{
                include:[
                    {
                        model:models.wms_data_details_tbl,
                        as:'details'
                    }
                ]
            }
        })

        const draft_bill = await wmsDraftBill.generateDraftBill({
            wms_data,
            transaction_date: date,
            job_id:null
        })


        res.send(draft_bill)
    }
    catch(e){
        next(e)
    }
})

router.get('/tms', async(req,res) => {
    const {rdd} = req.query;
    const data = await models.helios_invoices_hdr_tbl.getData({
        options:{
            include:[
                {
                    model: models.ship_point_tbl,
                    attributes:['city','region'],
                    as:'ship_point_to'
                }
            ]
        },
        where:{
            rdd,
            location:'Zeus',
            vehicle_type:'L300CV',
            trucker_id:'02220',
            is_processed_buy: 0
        }
    })  

    res.json(data)
})

router.post('/pod',async(req,res)=>{
    try{
        const {rdd} = req.query;

        const invoice = await heliosService.bookings.getBookingRequest({
            rdd
        })

        await sequelize.transaction(async t => {
            await models.helios_invoices_hdr_tbl.bulkCreateData({
                data:invoice.header,
                options:{
                    transaction:t,
                    updateOnDuplicate: ['updatedAt','vehicle_type','vehicle_id','trip_no'],
                    logging:false
                }
            })

            await models.helios_invoices_dtl_tbl.bulkCreateData({
                data:invoice.details,
                options:{
                    transaction:t,
                    ignoreDuplicates:true,
                    logging: false
                }
            })
        })

        res.status(200).json(invoice)
    }
    catch(e){
        throw e
    }
})

router.post('/pod/draft-bill', async(req,res) => {
    const {rdd} = req.query;

    const invoices = await (models.helios_invoices_hdr_tbl.getData({
        where:{
            rdd,
            is_processed_buy: 0
        },
        options:{
            include:[
                {model: models.ship_point_tbl, as:'ship_point_from'},
                {model: models.ship_point_tbl, as:'ship_point_to'},
                {model: models.helios_invoices_dtl_tbl},
                {model: models.vendor_tbl},
                {
                    model: models.vendor_group_dtl_tbl,
                    required: false,
                    where:Sequelize.where(Sequelize.col('vendor_group_dtl_tbl.location'),Sequelize.col('helios_invoices_hdr_tbl.location'))
                },
            ]
        }
    }))
    .then(result => {
        return result.map(item => {
            const {
                vendor_tbl,
                vendor_group_dtl_tbl,
                ...invoice
            } = item;

            return {
                ...invoice,
                vg_code:vendor_group_dtl_tbl?.vg_code || null,
                is_ic: vendor_tbl?.is_ic || 0
            }
        })
    })

    const {data,revenue_leak} = await transportDraftBill.buy({
        invoices,
        rdd
    })


    res.status(200).json({
        data,
        revenue_leak
    })
   
})

router.get('/contracts', async(req,res) => {
    const {rdd} = req.query
    const algo = await models.agg_tbl.getData({
        where:{
            id: 'SecXdock-CBM-WAgg-WMgv-WGrp'
        },
        options:{
            include:[
                {
                    model:models.agg_conditions_tbl,
                    required: false
                }
            ]
        }
    })

    const conditions = await models.agg_conditions_tbl.findAll({
        where:{
            agg_id:'SecXdock-CBM-WAgg-WMgv-WGrp'
        }
    })
    // const contracts = await models.contract_hdr_tbl.getContracts({
    //     where:{
    //         contract_type:'SELL',
    //         contract_id: 'PNG',
    //         contract_status:'APPROVED',
    //         valid_from: {
    //             [Op.lte]: rdd
    //         },
    //         valid_to:{
    //             [Op.gte]: rdd
    //         }
    //     },
    //     options:{
    //         include:[
    //             {
    //                 model:models.contract_tariff_dtl,
    //                 include:[
    //                     {
    //                        model: models.tariff_sell_hdr_tbl,
    //                     },
    //                     {
    //                         model:models.agg_tbl,
    //                         required:false,
    //                         include:[
    //                             {
    //                                 model:models.agg_conditions_tbl,
    //                                 required: false
    //                             }
    //                         ],
    //                         //include:models.agg_conditions_tbl,
    //                     },
    //                     // {
    //                     //     model:models.agg_conditions_tbl,
    //                     // },
    //                     {
    //                         model: models.tariff_ic_algo_tbl,
    //                         required:false,
    //                     }
    //                 ],
    //                 required:false,
    //                 where:{
    //                     status:'ACTIVE',
    //                     valid_from: {
    //                         [Op.lte]: rdd
    //                     },
    //                     valid_to:{
    //                         [Op.gte]: rdd
    //                     }
    //                 },
               
    //             },
    //         ]
    //     },
    // })

    res.status(200).json({
        //contracts
        algo,
        conditions
    })
})

module.exports = router 