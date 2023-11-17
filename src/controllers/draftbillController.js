const { Sequelize, sequelize } = require('../models/rata');
const models = require('../models/rata');
const draftBillService = require('../services/draftbillService');
const useGlobalFilter = require('../helpers/filters');
const moment = require('moment');

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
                    {model: models.helios_invoices_dtl_tbl},
                    {
                        model: models.ship_point_tbl, 
                        as:'ship_point_from',
                        required:false,
                        where:{
                            is_active: 1
                        }
                    },
                    {
                        model: models.ship_point_tbl, 
                        as:'ship_point_to',
                        required:false,
                        where:{
                            is_active: 1
                        }
                    },
                    {
                        model: models.vendor_tbl,
                        required: false,
                        where:{
                            vendor_status: 'ACTIVE'
                        }
                    },
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

exports.getDraftBill = async(req,res,next) => {
    try{

        const {
            page,
            totalPage,
            search,
            ...filters
        } = req.query;

        const where = {};

        Object.keys(filters).map(key =>  {
            if(key === 'draft_bill_type'){
                return where[key] = filters[key]   
            }
            if(key === 'delivery_date'){
                const dates = filters.delivery_date.split(',')
                const from = moment(dates[0]).isValid() ? dates[0] : null;
                const to = moment(dates[1]).isValid() ? dates[1] : null;
                
                if (from && to) {
                    return where.delivery_date = {
                        [Sequelize.Op.and]: {
                            [Sequelize.Op.gte] : from,
                            [Sequelize.Op.lte] : to
                        } 
                    }
                }
            }
            if(key === 'draft_bill_date'){
                const dates = filters.draft_bill_date.split(',')
                const from = moment(dates[0]).isValid() ? dates[0] : null;
                const to = moment(dates[1]).isValid() ? dates[1] : null;
                
                if (from && to) {
                    return where.draft_bill_date = {
                        [Sequelize.Op.and]: {
                            [Sequelize.Op.gte] : from,
                            [Sequelize.Op.lte] : to
                        } 
                    }
                }

            }
            else{
                return where[key] = filters[key]
            }
        })

        const globalFilter = useGlobalFilter.defaultFilter({
            model:models.draft_bill_hdr_tbl.rawAttributes,
            filters:{
                search
            }
        })

        const {count,rows} = await models.draft_bill_hdr_tbl.paginated({
            filters:{
                ...where,
                ...globalFilter
            },
            order:[['createdAt','DESC']],
            page,
            totalPage,
            options:{
                include:[
                    {
                        model:models.draft_bill_details_tbl,
                        required: false,
                        as:'details',
                        include:[{
                            model: models.helios_invoices_hdr_tbl,
                            as:'invoice'
                        }]
                    }
                ],
                distinct: true
            }
        })

        res.status(200).json({
            data:rows.map(item => {
                const {details,...header} = item;
                return {
                    ...header,
                    details: details.map((dtl) => {
                        return{
                            ...dtl,
                            planned_vehicle_type: dtl.invoice.planned_vehicle_type
                        }
                    }),
                }
            }),
            rows:count,
            pageCount: Math.ceil(count/totalPage)
        })
    }
    catch(e){
        next(e)
    }
}

exports.getWMSDraftBill = async(req,res,next) => {
    try{
        const {
            page,
            totalPage,
            search,
            ...filters
        } = req.query;
      
        const where = {};
        Object.keys(filters).map(key =>  {
            if(key === 'draft_bill_date'){
                return where.draft_bill_date = {
                    [Sequelize.Op.between]: filters.draft_bill_date.split(',')
                }
            }
            else{
                return where[key] = filters[key]
            }
        })

        const globalFilter = useGlobalFilter.defaultFilter({
            model:models.wms_draft_bill_hdr_tbl.rawAttributes,
            filters:{
                search
            }
        })

        const {count,rows} = await models.wms_draft_bill_hdr_tbl.paginated({
            filters:{
                ...where,
                ...globalFilter
            },
            order:[['createdAt','DESC']],
            page,
            totalPage,
            options:{
                include:[
                    {
                        model:models.wms_draft_bill_dtl_tbl,
                        required: false,
                        as:'details'
                    }
                ]
            }
        })

        res.status(200).json({
            data:rows,
            rows:count,
            pageCount: Math.ceil(count/totalPage)
        })
        
    }
    catch(e){
        next(e)
    }
}