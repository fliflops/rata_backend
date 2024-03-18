const reportService = require('../services/reports.service');
const moment = require('moment');
const path = require('path');
const {REPORT_P2P, REPORT_CROSSDOCK} = require('../jobs/queues/queues')
const Queue = require('../jobs/queues/queues');
const redis = require('../../config').redis;

exports.createPreBillingReport = async(req,res,next) => {
    try{
     

      
                // await REPORT_CROSSDOCK.add()
        res.end();
    }
    catch(e){
        next(e)
    }
}

exports.createP2PReport = async(req,res,next) => {
    try{
        // await REPORT_P2P.add()
        // res.end();
    }
    catch(e){
        next(e)
    }
}

exports.getPaginatedReports = async(req,res,next) => {
    try{    
        const data = await reportService.getReporHeader(req.query);
        
        res.status(200).json({
            data: data.rows,
            rows:data.count,
            pageCount: data.pageCount
        })
    }
    catch(e){
        next(e)
    }
}

exports.getPaginatedReportDetails = async(req,res,next) => {
    const {report_name} = req.params;
    const query = req.query;

    const data = await reportService.getReportLogs(query, report_name);
        
    res.status(200).json({
        data: data.rows,
        rows:data.count,
        pageCount: data.pageCount
    })
}

exports.updateReport = async(req,res,next) => {
    try{
        const {report_name} = req.params;
        const body = req.body;

        await reportService.updateReport({
            filter:{
                report_name
            },
            data:{
                is_active: body.is_active,
                cron: body.cron
            }
        })

        await redis.json.set(body.id,'.',{
            redis_key: body.redis_key,
            is_active: body.is_active,
            start_time_cron: body.cron
        })

        if(body.is_active === 0){
            await Queue[body.id].obliterate({force: true})
        }
        else{
            await Queue[body.id].obliterate({force: true})
            await Queue[body.id].add({
                isRepeatable: true
            },
            {
                
                removeOnFail:true,
                removeOnComplete:true,
                repeat:{
                    cron: body.cron
                }
            })
        }

        res.end();
    }
    catch(e){
        next(e)
    }
}

exports.downloadReport = async(req,res,next) => {
    try{
        const {filePath} = req.query;
        
        res.download(filePath)
    }
    catch(e){
        next(e  )
    }
    

}