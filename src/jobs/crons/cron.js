const Queue = require('../queues/queues');
//const {RATA_DRAFT_BILL_BUY,RATA_DRAFT_BILL_SELL,TMS_DATA_SYNC,WMS_DATA_SYNC,RATA_DRAFT_BILL_WMS} = Queue;
const models = require('../../models/rata');
const {redis} = require('../../../config');
const moment = require('moment')

const getReportSchedulers = async() => {
    const schedulers = await models.report_schedule_tbl.findAll().then(result => JSON.parse(JSON.stringify(result)))

    schedulers.forEach(async item => {
        await redis.json.set(item.id, '.', {
            redis_key: item.redis_key,
            is_active: item.is_active,
            start_time_cron: item.cron
        })
    })

    return schedulers.map(({cron,...item}) => {
        return {
            ...item,
            start_time_cron: cron
        }
    })
}



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
    const reportSchedulers = await getReportSchedulers();

    reportSchedulers.filter(item => item.is_active === 0)
    .map(async item => {
        await Queue[item.id].obliterate({force:true})
    })

    //Obliterate Inactive Queues;
    schedulers.filter(item => item.is_active === 0)
    .map(async item => {
        await Queue[item.id].obliterate({force:true})
    })

    reportSchedulers.filter(item => item.is_active === 1)
    .map(async item => {
        await Queue[item.id].obliterate({force:true})
        await Queue[item.id].add({
            isRepeatable: true
        },
        {
            repeat:{
                cron: item.start_time_cron
            },
            //timeout:'4 * 60 * 1000',
            removeOnFail:true,
            removeOnComplete:true
        })
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
            timeout: 1800000,
            removeOnFail:true,
            removeOnComplete:true
        })
    })
}