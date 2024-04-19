const podReportService = require('../../services/podReport.service')
const podReportExcelService = require('../../services/podReport.excel.service')
const reportService = require('../../services/reports.service');
const moment = require('moment')
const path = require('path')

const {REPORT_ACC_EXPENSE} = require('../queues/queues')

module.exports = () => {

    REPORT_ACC_EXPENSE.process(async(job, done) => {
        try{
            let draft_bill_header  = [];
            let draft_bill_details = [];
            let leak_header = [];
            let leak_details = [];

            const to = moment().subtract(2,'days').format('YYYY-MM-DD')
            const from = moment(to).startOf('month').format('YYYY-MM-DD')

            const report = await reportService.findReport({
                report_name: 'accrual_expense'
            })

            await reportService.createReportLog({
                id: job.id,
                report_id: report.id,
                report_status:'INPROGRESS',
            })


        const data = await podReportService.joinedInvoices({
            from,
            to
        })

        const draftBill = await podReportService.podBuy({
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
                draft_bill_type:'BUY',
            })
            leak_details = leak_details.concat(details.map(items => ({
                ...items,
                class_of_store: leak.class_of_store,
                draft_bill_type:'BUY'
            })))
        }

        const root = global.appRoot;
        const fileName = moment().format('YYYYMMDDHHmmss')+'revenue_accrual_report.xlsx'
        const filePath = path.join( root,'/assets/reports/accrual/', fileName);

        await podReportExcelService.podAccrualTemplate(
            {
                header:         draft_bill_header,
                details:        draft_bill_details,
                leak_header:    leak_header,
                leak_details:   leak_details,
                filePath,
                type:'BUY',
                from: moment(from).format('MMMM DD, YYYY'),
                to:moment(to).format('MMMM DD, YYYY'),
            }
        )
        
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

    REPORT_ACC_EXPENSE.on('completed', async(job) => {
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

        console.log('Accrual Expense Report Done')
    })

    REPORT_ACC_EXPENSE.on('failed', async(job,err) => {
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