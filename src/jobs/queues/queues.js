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
    RATA_DRAFT_BILL_BUY:    new Bull('rata:transport_draft_bill_buy', connection),

    REPORT_CROSSDOCK:       new Bull('rata:reports:crossdock-secondary', {
        redis:redisConfig,
        settings:{
            lockDuration: 1800000,
        }
    }),
    REPORT_P2P:             new Bull('rata:reports:p2p', connection),
    REPORT_ACC_EXPENSE:     new Bull('rata:reports:accrual-expense', connection),
    REPORT_ACC_REVENUE:     new Bull('rata:reports:accrual-revenue', connection)
    
}