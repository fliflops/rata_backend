const {REPORT_CROSSDOCK} = require('../queues/queues');
const reportService = require('../../services/reports.service');
const asciiService = require('../../services/asciiService')

const moment = require('moment');
const path = require('path');
const sequelize = require('sequelize');

module.exports = () => {
    REPORT_CROSSDOCK.process(async (job, done) => {
        try{
            const filters = reportService.generateFilter();
            const root = global.appRoot;
            const fileName = moment().format('YYYYMMDDHHmmss')+'crossdock-secondary.xlsx';
            const filePath = path.join(root,'/assets/reports/pre-billing/',fileName);
            
            job.progress(10)

            const draftBills = await reportService.getDraftBill({
                service_type: '2001',
                updatedAt:{
                    //[sequelize.Op.between]:['2024-03-22 00:00:00','2024-04-21 00:00:00']
                    [sequelize.Op.between]: [filters.from,filters.to]
                }
            });
            job.progress(30)

            const ascii = await asciiService.getSalesOrder(draftBills.length === 0 ? '' : draftBills.map(item => item.draft_bill_no))
            job.progress(80)

            await reportService.crossDockSecondary({
                data: draftBills.filter(item => ascii.map(a => a.SO_CODE).includes(item.draft_bill_no)),
                dates:filters,
                filePath
            })
            job.progress(100)

            return done(null,{
                filePath,
                fileName
            });
        }
        catch(e){
            done(e)
        }
    })

    REPORT_CROSSDOCK.on('active', async(job) => {
        const isJobExists = await reportService.getReportLog({
            id: job.id
        })

        if(!isJobExists) {
            const report = await reportService.findReport({
                report_name: 'crossdock_secondary'
            })
    
            await reportService.createReportLog({
                id: job.id,
                report_id: report.id,
                report_status:'INPROGRESS',
                // file_path: filePath,
                // file_name: fileName
            })
        }
    })

    REPORT_CROSSDOCK.on('completed', async(job) => {
        await reportService.updateReportLog({
            filter:{
                id: job.id,
            },
            data:{
                report_status:'DONE',
                file_path: job.returnvalue.filePath,
                file_name: job.returnvalue.fileName
            }
        })    
    })

    REPORT_CROSSDOCK.on('failed', async(job,err) => {
        console.log(err)
        await reportService.updateReportLog({
            filter:{
                id: job.id,
            },
            data:{
                report_status:'FAILED',
                err_message: err.message
            }
        })
    })

}
