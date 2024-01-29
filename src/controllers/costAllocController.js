const models = require('../models/rata');
const costAllocService = require('../services/costalloc.service');

exports.createCostAlloc = async(req,res,next) => {
    try{
        const data = req.body;

        const isExist = await costAllocService.isCostAllocExists({
            service_type: data.service_type,
            draft_bill_type: data.draft_bill_type
        })

        if(isExist) return res.status(400).json({
            message: `${data.service_type} and ${data.draft_bill_type} combination exists!`
        })

        await costAllocService.createCostAlloc({
            ...data,
            created_by: req.processor.id
        })


        res.status(200).end();

    }
    catch(e){
        next(e)
    }
}

exports.getPaginated = async(req,res,next) => {
    try{
        const query = req.query;
        const data = await costAllocService.getPaginatedCostAlloc(query)
        res.status(200).json({
            data: data.rows,
            rows:data.count,
            pageCount: data.pageCount
        })
    }
    catch(e){
        next(e)
    }
}

exports.updateCostAlloc = async(req,res,next) => {
    try{
        const {id} = req.query; 
        const body = req.body;

        await costAllocService.updateCostAlloc({
            ...body,
            updated_by: req.processor.id
        }, {
            id
        })

        res.status(200).end();
    }
    catch(e){
        next(e)
    }
}

exports.getPaginatedDetails = async(req,res,next) => {
    try{
        const query = req.query;
        const data = await costAllocService.getPaginatedCostAllocDetails(query)
        res.status(200).json({
            data: data.rows,
            rows:data.count,
            pageCount: data.pageCount
        })

    }
    catch(e){
        next(e)
    }
}