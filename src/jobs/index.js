const {wmsautosync,wmsdraftbill} =require('./warehouseWorker');
const {tmsautosync,transportSell,transportBuy} = require('./transportWorker');

module.exports = () => {
    wmsautosync()
    wmsdraftbill()
    tmsautosync()
    transportSell()   
    transportBuy()
}