const models = require('../models/rata');
const moment = require('moment');
const {Queue} = require('bullmq');
const {v4:uuidv4} = require('uuid');

const {ioredis} = require('../../config');

exports.getScheduler = async(req,res,next) => {
    try{
        const {
            page,
            totalPage,
            ...filters
        } = req.query;

        const {count,rows} = await models.scheduler_setup_tbl.paginated({
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

exports.getSchedulerDetails = async(req,res,next) => {
    try{
        const {
            page,
            totalPage,
            ...filters
        } = req.query;

        const {count,rows} =  await models.scheduler_auto_sync_trckr_tbl.paginated({
            filters,
            order: [
                ['createdAt','DESC']
            ],
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

exports.postManualTrigger = async(req,res,next) => {
    try{
        const {id,date} = req.body;

        if(!id){
            return res.status(400).json({
                message:'Invalid Scheduler ID'
            })
        }

        if(!date) {
            return res.status(400).json({
                message:'Invalid Date'
            })
        }


        const getScheduler = await models.scheduler_setup_tbl.getID(id)

        if(!getScheduler){
            return res.status(400).json({
                message:'Invalid Scheduler ID'
            })
        }

        const scheduler_key = getScheduler.redis_scheduler_key.split(':')
        const queue_key = scheduler_key[1];
        const connection = ioredis
        
        //instantiate queue
        const myQueue = new Queue(getScheduler.redis_scheduler_key,{connection})

        //clear the existing jobs to prevent duplication
        await myQueue.obliterate()

        //activate worker
        await myQueue.add(queue_key,
            {date: moment(date).format('YYYY-MM-DD')},
            {
                jobId:uuidv4(),
                removeOnComplete:true,
                removeOnFail:true,
            })

        res.status(200).json(id)

    }
    catch(e){
        next(e)
    }
}