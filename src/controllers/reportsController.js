const reportService = require('../services/reports.service');

const moment = require('moment');
const path = require('path');
const {REPORT_P2P, REPORT_CROSSDOCK} = require('../jobs/queues/queues')
const Queue = require('../jobs/queues/queues');
const redis = require('../../config').redis;
const {v4:uuidv4} = require('uuid');
const sequelize = require('sequelize')
const asciiService = require('../services/asciiService');
const _ = require('lodash')

exports.createPreBillingReport = async(req,res,next) => {
    try{
        // const filter = await reportService.generateFilter();

        // const data = await asciiService.getSalesOrder({
        //     from: filters.from,
        //     to:filters.to
        // });
        // res.status(200).json(data)
     
        await REPORT_CROSSDOCK.add(null, {
            jobId:uuidv4(),
            removeOnFail:true,
            removeOnComplete:true
        })
        // res.end();

        // const filter = await reportService.generateFilter()
        const draftBill = await reportService.getDraftBill({
            service_type:'2001',
            updatedAt: {
                [sequelize.Op.between]:['2024-01-01 00:00:00', '2024-01-31 00:00:00']
                //[sequelize.Op.between]:[filter.from,filter.to]
            },
        })

        const ascii = await asciiService.getSalesOrder(draftBill.map(item => item.draft_bill_no))

        res.status(200).json({
            data:draftBill.filter(item => ascii.map(a => a.SO_CODE).includes(item.draft_bill_no)),
        });
    }
    catch(e){
        next(e)
    }
}

exports.createP2PReport = async(req,res,next) => {
    try{
       
        const filters = await reportService.generateFilter();
        const draftBills = await reportService.getDraftBill({
            customer: '10005',
            service_type:'2003',
            updatedAt:{
                [sequelize.Op.between]: [filters.from,filters.to]
            },
            
        });
        await REPORT_P2P.add(null, {
            jobId:uuidv4(),
            removeOnFail:true,
            removeOnComplete:true
        });
        res.json(draftBills);
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

exports.pod = async (req,res,next) => {
    
}

exports.reverseLogistics = async(req,res,next) => {
    try{
        const draftBill = await reportService.getDraftBill({
            service_type:'2007',
            updatedAt: {
                [sequelize.Op.between]:['2024-01-01 00:00:00', '2024-01-31 00:00:00']
                //[sequelize.Op.between]:[filter.from,filter.to]
            },
        })

        const ascii = await asciiService.getSalesOrder(draftBill.map(item => item.draft_bill_no))

        res.status(200).json({
            data:draftBill.filter(item => ascii.map(a => a.SO_CODE).includes(item.draft_bill_no)),
        });
    }
    catch(e){
        next(e)
    }
}