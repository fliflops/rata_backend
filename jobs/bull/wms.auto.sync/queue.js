const{Queue} = require('bullmq');
const {v4:uuidv4} = require('uuid');
const redis = require('../../../config').redis

exports.wmsAutoSyncProduce = async({date,connection}) => {
    try{
        const redis_key = 'rata:wms_data_sync';
        const cron = JSON.parse(JSON.stringify(await redis.json.get(redis_key)))
        
        //queue id 
        const myQueue = new Queue('rata:wmsautosync',{connection})
        
        //clear the existing jobs to prevent duplication
        await myQueue.obliterate()

        //wms autosync
        await myQueue.add('wmsautosync',{date},{
            repeat:{
                pattern:`* ${cron.start_time_cron}`,
                limit:1,
                jobId:uuidv4(),
                //tz:'PHT'
            },
            removeOnComplete:true,
            removeOnFail:true,
            jobId:uuidv4()
        })

        console.log(await myQueue.getRepeatableJobs())
    }
    catch(e){
        throw e
    }
}


