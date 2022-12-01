const moment = require('moment')
const jobs = require('../jobs')
const connection = require('../config/ioredis')
const redis = require('../config').redis

module.exports = async () => {
    //initiate workers
    await jobs.wmsautosyncWorkers.wmsautosyncWorker(connection)


    //add to job to queue
    await jobs.wmsautosyncQueues.wmsAutoSyncProduce({
        date:moment().format('YYYY-MM-DD'),
        connection
    })

    
}