const {wmsautosync,wmsdraftbill} =require('./warehouseWorker');
const {tmsautosync,transportSell,transportBuy} = require('./transportWorker');

const crossdockReport = require('./reports/crossdockWorker');
const p2pReport = require('./reports/p2pWorker');
const crons = require('./crons');

module.exports = () => {
    wmsautosync()
    wmsdraftbill()
    tmsautosync()
    transportSell()   
    transportBuy()
    crossdockReport()
    p2pReport()
    crons();

}