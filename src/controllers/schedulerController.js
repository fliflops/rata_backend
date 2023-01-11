const models = require('../models/rata');
const moment = require('moment');
const {v4:uuidv4} = require('uuid');
const Queue = require('../jobs/queues/queues');

const redis = require('../../config').redis

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
                ...data
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
