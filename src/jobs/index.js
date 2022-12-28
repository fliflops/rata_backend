const {wmsautosync,wmsdraftbill} =require('./warehouseWorker');
const {tmsautosync,transportSell,transportBuy} = require('./transportWorker');
const crons = require('./crons');

module.exports = () => {
    wmsautosync()
    wmsdraftbill()
    tmsautosync()
    transportSell()   
    transportBuy()

    crons();

}