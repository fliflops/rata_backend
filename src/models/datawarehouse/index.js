const Sequelize = require('sequelize');
const {dwConfig,dwPodConfig, dwbConfig}    = require('../../../config');
const rata_daily_accrual_header = require('./rata_daily_accrual_header');
const rata_daily_accrual_details = require('./rata_daily_accrual_details');
const rata_daily_accrual_leak_header = require('./rata_daily_accrual_leak_header');
const rata_daily_accrual_leak_details = require('./rata_daily_accrual_leak_details');

const kronos = new Sequelize({
    ...dwConfig,
    database: process.env.DW_KRONOS_DB
})

const pod = new Sequelize({
    ...dwPodConfig,
})



const dwh = new Sequelize({
    ...dwbConfig,
})

const models = {
    rata_daily_accrual_header: rata_daily_accrual_header.init(dwh),
    rata_daily_accrual_details: rata_daily_accrual_details.init(dwh),
    rata_daily_accrual_leak_header: rata_daily_accrual_leak_header.init(dwh),
    rata_daily_accrual_leak_details: rata_daily_accrual_leak_details.init(dwh)
}

module.exports = {
    kronos,
    pod,
    dwh,
    ...models
}