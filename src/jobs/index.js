const {wmsautosync,wmsdraftbill} =require('./warehouseWorker');
const {tmsautosync,transportSell,transportBuy} = require('./transportWorker');

const crossdockReport = require('./reports/crossdockWorker');
const p2pReport = require('./reports/p2pWorker');
const accrualRevenue = require('./reports/accrualRevenue');
const accrualExpense = require('./reports/accrualExpense');

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
    crons();
}