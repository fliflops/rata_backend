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
            const date = moment();
            const from = date.subtract(18,'days').format('YYYY-MM-DD HH:mm:ss');
            const to = date.subtract(3,'days').format('YYYY-MM-DD HH:mm:ss');

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
                service_type: '2001',
                //customer: '10005',
                updatedAt:{
                    //[sequelize.Op.between]:['2024-04-01 00:00:00', '2024-04-30 00:00:00']
                    [sequelize.Op.between]: [from,to]
                }
            });

            const ascii = await asciiService.getSalesOrder(draftBills.length === 0 ? '' : draftBills.map(item => item.draft_bill_no))

            await reportService.crossDockSecondary({
                data: draftBills.filter(item => ascii.map(a => a.SO_CODE).includes(item.draft_bill_no)),
                dates:filters,
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