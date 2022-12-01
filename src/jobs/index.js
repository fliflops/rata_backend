const {getTransportData,draftBillSell,draftBillBuy} = require('./transport/transportWorker')
const connection = require('../../config/ioredis')

module.exports = async () => {
    //Update or Create Transport Data  Worker
    await getTransportData(connection)
    await draftBillSell(connection)
    await draftBillBuy(connection)
}