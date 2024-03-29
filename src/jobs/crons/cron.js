const Queue = require('../queues/queues');
//const {RATA_DRAFT_BILL_BUY,RATA_DRAFT_BILL_SELL,TMS_DATA_SYNC,WMS_DATA_SYNC,RATA_DRAFT_BILL_WMS} = Queue;
const models = require('../../models/rata');
const {redis} = require('../../../config');
const moment = require('moment')
const getSchedulers = async () => {
    const schedulers = await models.scheduler_setup_tbl.getData({})
    
    schedulers.map(async item => {
        await redis.json.set(item.id, '.', {
            redis_key: item.redis_key,
            is_active: item.is_active,
            start_time_label: item.start_time_label,
            start_time_cron: item.start_time_cron
        })
    })

    return schedulers;
}

module.exports =  async () => {
    const schedulers = await getSchedulers();

    //Obliterate Inactive Queues;
    schedulers.filter(item => item.is_active === 0)
    .map(async item => {
        await Queue[item.id].obliterate({force:true})
    })

    //Add new Queus
    schedulers.filter(item => item.is_active === 1)
    .map(async item => {
        await Queue[item.id].obliterate({force:true})
        await Queue[item.id].add({
            isRepeatable: true
        },
        {
            repeat:{
                cron: item.start_time_cron
            },
            removeOnFail:true,
            removeOnComplete:true
        })
    })
}