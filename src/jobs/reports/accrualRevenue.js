const podReportService = require('../../services/podReport.service')
const podReportExcelService = require('../../services/podReport.excel.service')
const reportService = require('../../services/reports.service');
const moment = require('moment')
const path = require('path')

const {REPORT_ACC_REVENUE} = require('../queues/queues')

module.exports = () => {
    REPORT_ACC_REVENUE.process(async (job, done) => {
        try{
            let draft_bill_header  = [];
            let draft_bill_details = [];
            let leak_header = [];
            let leak_details = [];
            
            const from = moment().subtract(1,'month').startOf('month').format('YYYY-MM-DD');
            const to = moment().subtract(1,'month').endOf('month').format('YYYY-MM-DD')

            const data = await podReportService.joinedInvoices({
                from,
                to
            })
    
            const draftBill = await podReportService.podSell({
                data,
                from,
                to
            })
    
            for(let {details,...db} of  draftBill.draft_bill){
                draft_bill_header.push(db)
                draft_bill_details = draft_bill_details.concat(details)
            }
            
            for(let {details,...leak} of  draftBill.revenue_leak){
                leak_header.push({
                    ...leak,
                    draft_bill_type:'SELL',
                })
                leak_details = leak_details.concat(details.map(items => ({
                    ...items,
                    class_of_store: leak.class_of_store,
                    draft_bill_type:'SELL'
                })))
            }
    
            const root = global.appRoot;
            const fileName = moment().format('YYYYMMDDHHmmss')+'revenue_accrual_report.xlsx'
            const filePath = path.join( root,'/assets/reports/accrual/', fileName);
    
            await podReportExcelService.podAccrualTemplate({
                header:         draft_bill_header,
                details:        draft_bill_details,
                leak_header:    leak_header,
                leak_details:   leak_details,
                filePath,
                type:'SELL',
                from: moment(from).format('MMMM DD, YYYY'),
                to:moment(to).format('MMMM DD, YYYY'),
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

    REPORT_ACC_REVENUE.on('active', async(job) => {
        const isJobExists = await reportService.getReportLog({
            id: job.id
        })

        if(!isJobExists) {
            const report = await reportService.findReport({
                report_name: 'accrual_revenue'
            })
    
            await reportService.createReportLog({
                id: job.id,
                report_id: report.id,
                report_status:'INPROGRESS',
            })
        }
    })

    REPORT_ACC_REVENUE.on('completed', async(job) => {
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

    REPORT_ACC_REVENUE.on('failed', async(job,err) => {
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