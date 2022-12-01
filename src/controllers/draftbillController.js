const { Sequelize, sequelize } = require('../models/rata');
const models = require('../models/rata');
const draftBillService = require('../services/draftbillService');

exports.createDraftBillBuy = async(req,res,next) => {
    try{

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

        const {data,revenue_leak} = await draftBillService.buy({
            invoices,
            rdd
        })

        //

        res.status(200).json({
            data,
            revenue_leak
        })
        
    }
    catch(e){
        next(e)
    }
}

exports.createDraftBillSell = async(req,res,next) => {
    try{
        const {rdd} = req.query;
        const invoices = await models.helios_invoices_hdr_tbl.getData({
            where:{
                rdd,
                is_processed_sell: 0
            },
            options:{
                include:[
                   {model: models.helios_invoices_dtl_tbl},
                   {model: models.vendor_tbl},
                   {model: models.ship_point_tbl, as:'ship_point_from'},
                   {model: models.ship_point_tbl, as:'ship_point_to'}
                ]
            }
        })
      
        const {data,revenue_leak} = await draftBillService.sell({
            invoices,
            rdd
        })
    
        res.status(200).json({
            data,
            revenue_leak
        })

    }
    catch(e){
        next(e)
    }
}

