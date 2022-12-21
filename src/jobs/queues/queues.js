// const {Queue} = require('bullmq');
// const connection = require('../../../config/ioredis');


// module.exports = { 
//     RATA_DRAFT_BILL_BUY:    new Queue('rata:transport_draft_bill_buy',{connection}),
//     RATA_DRAFT_BILL_SELL:   new Queue('rata:transport_draft_bill_sell',{connection}),
//     RATA_DRAFT_BILL_WMS:    new Queue('rata:warehouse_draft_bill',{connection}),    
//     TMS_DATA_SYNC:          new Queue('rata:tmsautosync',{connection}),
//     WMS_DATA_SYNC:          new Queue('rata:wmsautosync',{connection})
// }

const Bull = require('bull');
const {redisConfig} = require('../../../config')
const connection = {
    redis:redisConfig
}

module.exports = { 
    TMS_DATA_SYNC:          new Bull('rata:tmsautosync',connection),
    WMS_DATA_SYNC:          new Bull('rata:wmsautosync',connection),
    RATA_DRAFT_BILL_WMS:    new Bull('rata:warehouse_draft_bill',connection),
    RATA_DRAFT_BILL_SELL:   new Bull('rata:transport_draft_bill_sell', connection),
    RATA_DRAFT_BILL_BUY:    new Bull('rata:transport_draft_bill_buy', connection)
}