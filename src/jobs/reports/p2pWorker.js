const {REPORT_P2P} = require('../queues/queues');
const reportService = require('../../services/reports.service');
const asciiService = require('../../services/asciiService')
const moment = require('moment');
const path = require('path');
const sequelize = require('sequelize');

module.exports = () => {
    REPORT_P2P.process(async (job, done) => {
        try{
            const filters = reportService.generateFilter();
            const root = global.appRoot;
            const fileName = moment().format('YYYYMMDDHHmmss')+'p2p.xlsx';
            const filePath = path.join(root,'/assets/reports/pre-billing/',fileName);
           

            const isJobExists = await reportService.getReportLog({
                id: job.id
            })

            if(isJobExists) {
                return done(null,{
                    filePath,
                    fileName
                });
            }

            const report = await reportService.findReport({
                report_name: 'p2p'
            })

            await reportService.createReportLog({
                id: job.id,
                report_id: report.id,
                report_status:'INPROGRESS',
            })

            const draftBills = await reportService.getDraftBill({
                customer: '10005',
                service_type:'2003',
                updatedAt:{
                    [sequelize.Op.between]: [filters.from,filters.to]
                }
            });

            const ascii = await asciiService.getSalesOrder(draftBills.map(item => item.draft_bill_no))

            await reportService.p2p({
                data: draftBills.filter(item => ascii.map(a => a.SO_CODE).includes(item.draft_bill_no)),
                filePath,
                dates:filters
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

    REPORT_P2P.on('completed', async(job) => {
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

    REPORT_P2P.on('failed', async(job,err) => {
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