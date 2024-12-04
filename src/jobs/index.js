const {wmsautosync,wmsdraftbill} =require('./warehouseWorker');
const {tmsautosync,transportSell,transportBuy} = require('./transportWorker');

const crossdockReport = require('./reports/crossdockWorker');
const p2pReport = require('./reports/p2pWorker');
const accrualRevenue = require('./reports/accrualRevenue');
const accrualExpense = require('./reports/accrualExpense');
const reverseLogistics = require('./reports/reverseLogistics');
const dailyAccrualExpense = require('../jobs/dwh.workers/expense.accrual.worker');
const dailyAccrualRevenue = require('../jobs/dwh.workers/revenue.accrual.worker');

const draftBillSellRanged = require('../jobs/draftbill-range/draftbill-sell');
const draftBillBuyRanged = require('../jobs/draftbill-range/draftbill-buy');

const crons = require('./crons');

module.exports = () => {
    wmsautosync()
    wmsdraftbill()
    tmsautosync()
    transportSell()   
    transportBuy()
    crossdockReport()
    p2pReport();
    accrualExpense();
    accrualRevenue();
    reverseLogistics();
    dailyAccrualExpense();
    dailyAccrualRevenue();    
    draftBillSellRanged();
    draftBillBuyRanged();
    crons();
}