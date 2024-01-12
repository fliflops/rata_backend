const models = require('../models/rata');
const useGlobalFilter = require('../helpers/filters');
const moment = require('moment');

const {sequelize} = models;
exports.getTariffIC = async (req,res,next) => {
    try{
        const {
            page,
            totalPage,
            ...filters
        } = req.query;


        const {count,rows} = await models.tariff_ic_algo_tbl.paginated({
            filters,
            order: [['min_value','DESC']],
            page,
            totalPage
        })


        res.status(200).json({
            data:rows,
            rows:count,
            pageCount:Math.ceil(count/totalPage)
        })
    }
    catch(e){
        next(e)
    }
}

exports.getTariff = async(req,res,next) => {
    try{
        const {tariff_id} = req.params;

        const tariff = await models.tariff_sell_hdr_tbl.getOneData({
            options: {
                include: [
                    {
                        model:models.tariff_ic_algo_tbl,
                        required:false,
                        as:'ic_data'
                    }
                ]
            },
            where:{
                tariff_id
            }
        })

        res.status(200).json(tariff)
    }
    catch(e){
        next(e)
    }
}

exports.postTariffIC = async(req,res,next) => {
    try{
        const data = req.body;

        const tariff = await models.tariff_sell_hdr_tbl.getOneData({
            where:{
                tariff_id: data.tariff_id
            }
        })

        if(tariff.tariff_status !== 'DRAFT') {
            return res.status(400).json({
                message:'Tariff is already approved!'
            })
        }

        res.status(200).json({
            message:'Success!'
        })

    }
    catch(e){
        console.log(e)
        next(e)
    }
}

exports.putTariffIC = async(req,res,next) => {
    try{
        const {id} = req.query;
        const body = req.body;

        await models.tariff_ic_algo_tbl.updateData({
            data:{
                ...body,
                modified_by:req.processor.id
            },
            where:{
                id
            }
        })

        res.status(200).json({
            message:'Success!'
        })

    }
    catch(e){
        next(e)
    }
}

exports.updateTariff = async(req,res,next) => {
    const stx = await models.sequelize.transaction();
    try{
        const {
            tariff_id
        } = req.params

        const tariff = await models.tariff_sell_hdr_tbl.getOneData({
            options: {
                include: [
                    {
                        model: models.tariff_ic_algo_tbl,
                        required:false,
                        as:'ic_data'
                    }
                ]
            },
            where:{
                tariff_id: tariff_id
            }
        })

        if(!tariff) {
            return res.status(400).json({
                message:'Tariff does not exists!'
            })
        }

        if(tariff.tariff_status !== 'DRAFT') {
            return res.status(400).json({
                message:'Invalid Tariff Status'
            })
        }
  
        await models.tariff_sell_hdr_tbl.update({
            ...req.body,
            modified_by: req.processor.id
        },
        {
            where:{
                tariff_id
            },
            transaction: stx
        })

        await stx.commit();
        res.end();
    }
    catch(e){
        next(e)
    }
}

exports.approveTariff = async(req,res,next) => {
    const stx = await models.sequelize.transaction();
    try{
        const {
            tariff_id
        } = req.params;

        const {ic_data,...data} = req.body;

        const tariff = await models.tariff_sell_hdr_tbl.getOneData({
            options: {
                include: [
                    {
                        model: models.tariff_ic_algo_tbl,
                        required:false,
                        as:'ic_data'
                    }
                ]
            },
            where:{
                tariff_id
            }
        })

        if(!tariff) {
            return res.status(400).json({
                message:'Tariff does not exists!'
            })
        }

        if(tariff.tariff_status !== 'DRAFT') {
            return res.status(400).json({
                message:'Invalid Tariff Status'
            })
        }
     

        await models.tariff_sell_hdr_tbl.update({
            ...data,
            approved_by: req.processor.id,
            approved_date: moment().format('YYYY-MM-DD HH:mm:ss')
        },
        {
            where:{
                tariff_id
            },
            transaction: stx
        })


        if(tariff.ic_data.length === 0) {
            await models.tariff_ic_algo_tbl.bulkCreate(ic_data,{
                ignoreDuplicates:true,
                transaction: stx,
                updateOnDuplicate:['updatedAt','updated_by','algo_status']
            })
        }

        await stx.commit();
        
        res.end();
    }
    catch(e){
        next(e)
    }
}

exports.bulkUpdateStatus = async(req,res,next) => {
    try{
        const {data} = req.body;

        if(!data) throw 'Tariffs are required!';

        const tariffs = await models.tariff_sell_hdr_tbl.findAll({
            where:{
                tariff_id: data.map(item => item.tariff_id),
                tariff_status: 'DRAFT'
            }
        })

        if(tariffs.length !== 0)
        {
            await models.tariff_sell_hdr_tbl.update({
            tariff_status: 'APPROVED',
            updated_by:req.processor.id
            },
            {
                where:{
                    tariff_id: tariffs.map(item => item.tariff_id)
                }
            })
        }

        res.json(tariffs);
    }
    catch(e){
        next(e)
    }
} 

