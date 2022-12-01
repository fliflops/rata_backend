const models = require('../models/rata');

exports.getTariffIC = async (req,res,next) => {
    try{

        const {
            page,
            totalPage,
            ...filters
        } = req.query;


        const {count,rows} = await models.tariff_ic_algo_tbl.paginated({
            filters,
            order: [],
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

exports.postTariffIC = async(req,res,next) => {
    try{
        const data = req.body;

        await models.tariff_ic_algo_tbl.createData({
            data:{
                ...data,
                created_by: req.processor.id
            }
        })

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
                updated_by:req.processor.id
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