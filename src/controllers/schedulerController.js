const models = require('../models/rata');
const moment = require('moment');
const {v4:uuidv4} = require('uuid');
const Queue = require('../jobs/queues/queues');

const redis = require('../../config').redis;


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

exports.updateScheduler = async(req,res,next) => {
    try{

        const {data} = req.body;
        const {id} = req.query;
        
        await models.scheduler_setup_tbl.updateData({
            where:{
                id
            },
            data:{
                ...data,
                updated_by: req.processor.id
            }
        })


        //update redis 

        await redis.json.set(id,'.',data)

        if(data.is_active === 0){
            await Queue[id].obliterate({force: true})
        }
        else {
            await Queue[id].obliterate({force: true})
            await Queue[id].add({
                isRepeatable: true
            },
            {
                
                removeOnFail:true,
                removeOnComplete:true,
                timeout: 4 * 60 * 1000,
                repeat:{
                    cron: data.start_time_cron
                }
            })
        }

        res.status(200).end()
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
        
        await Queue[id].add({
            isRepeatable: false,
            date: moment(date).format('YYYY-MM-DD') 
        },
        {
            jobId:uuidv4(),
            removeOnFail:true,
            removeOnComplete:true
        })

        res.status(200).json(id)

    }
    catch(e){
        console.log(e)
        next(e)
    }
}

exports.getEmails = async(req,res,next) => {
    try{    
        const {
            page,
            totalPage,
            ...filters
        } = req.query;

        const {count,rows} =  await models.scheduler_email_tbl.paginated({
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

exports.postEmail = async(req,res,next) => {
    try{
        const {data} = req.body;

        const emails = await models.scheduler_email_tbl.findOneData({
            where:{
                email: data.email,
                scheduler_id: data.scheduler_id
            }
        })

        if(emails) {
            return res.status(400).json({
                message: 'Email already exists!'
            })
        }

        await models.scheduler_email_tbl.createData({
            data:{
                ...data,
                created_by: req.processor.id
            }   
        })

        res.status(200).end()    
    }
    catch(e){
        next(e)
    }
}

exports.putEmail = async(req,res,next) => {
    try{
        const {scheduler_id,email} = req.query;
        const {data} = req.body
        
        await models.scheduler_email_tbl.updateData({
            where:{
                scheduler_id,
                email
            },
            data: {
                ...data,
                updated_by: req.processor.id
            }
        })

        res.status(200).end(); 
    }
    catch(e){
        next(e)
    }
}

// controllers for cron testing
exports.cronTest = async(req,res,next) => {
    try{
        const { reportName } = req.query;

        await Queue.DWH_ACC_REVENUE.add({
            isRepeatable: false,  
        },
        {
            jobId:uuidv4(),
            removeOnFail:true,
            removeOnComplete:true
        })

        res.end();
    }
    catch(e){
        next(e)
    }

}