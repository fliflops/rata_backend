const {REPORT_CROSSDOCK} = require('../queues/queues');
const reportService = require('../../services/reports.service');
const moment = require('moment');
const path = require('path');
const sequelize = require('sequelize');

module.exports = () => {
    REPORT_CROSSDOCK.process(async (job, done) => {
        try{
            const filters = reportService.generateFilter();
            console.log(filters)

            const report = await reportService.findReport({
                report_name: 'crossdock_secondary'
            })

            await reportService.createReportLog({
                id: job.id,
                report_id: report.id,
                report_status:'INPROGRESS',
            })

            const root = global.appRoot;
            const fileName = moment().format('YYYYMMDDHHmmss')+'crossdock-secondary.xlsx';
            const filePath = path.join(root,'/assets/reports/pre-billing/',fileName);
            
            const draftBills = await reportService.getDraftBill({
                updatedAt:{
                    [sequelize.Op.between]: [filters.from,filters.to]
                }
            });
            await reportService.crossDockSecondary({
                data: draftBills,
                filePath
            })

            job.progress('completed')
            done(null,{
                filePath,
                fileName
            });
        }
        catch(e){
            done(e)
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