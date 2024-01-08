const models = require('../models/rata');
const useGlobalFilter = require('../helpers/filters');

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
    try{
        const {
            tariff_header,
            tariff_ic
        } = req.body;

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

        await sequelize.transaction(async t => {
            await models.tariff_sell_hdr_tbl.updateData({
                data:{
                    ...tariff_header
                },
                where:{
                    tariff_id: tariff_id
                },
                options:{
                    transaction: t
                }
            })

            if(tariff.ic_data.length === 0) {
                await models.tariff_ic_algo_tbl.bulkCreateData({
                    data: tariff_ic,
                    options:{
                        transaction: t,
                        ignoreDuplicates:true
                    }
                })
            }
        })

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

