module.exports = {
    wmsautosyncWorkers:require('./bull/wms.auto.sync').workers,
    wmsautosyncQueues:require('./bull/wms.auto.sync').queue
    
}