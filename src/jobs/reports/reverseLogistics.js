const {REPORT_REVERSE_LOGISTICS} = require('../queues/queues')
const reportService = require('../../services/reports.service');
const asciiService = require('../../services/asciiService')
const moment = require('moment');
const _ = require('lodash');
const path = require('path');
const sequelize = require('sequelize');

module.exports = () => {
    const generateFilter = () => {
        let filter = {
            from:null,
            to:null
        }
        const today = moment();
    
        if(today.date() <= 10){
            filter = {
                from: moment().subtract(48,'days').format('YYYY-MM-DD HH:mm:ss'), 
                to: moment().subtract(3,'days').format('YYYY-MM-DD HH:mm:ss')
            }
        }
        else if(today.date() <= 17){
            filter = {
                from: moment().subtract(48,'days').format('YYYY-MM-DD HH:mm:ss'), 
                to: moment().subtract(3,'days').format('YYYY-MM-DD HH:mm:ss')
            }
        }
        else if(today.date() <= 23){
            filter = {
                from: moment().subtract(48,'days').format('YYYY-MM-DD HH:mm:ss'), 
                to: moment().subtract(3,'days').format('YYYY-MM-DD HH:mm:ss')
            }
        }
        else{
            filter = {
                from: moment().subtract(48,'days').format('YYYY-MM-DD HH:mm:ss'), 
                to: moment().subtract(3,'days').format('YYYY-MM-DD HH:mm:ss')
            }
        }
        return filter
    }
     

    REPORT_REVERSE_LOGISTICS.process(async (job,done) => {
        try{
            console.log('test')
            //const filters = reportService.generateFilter();
            const filters = generateFilter();
            
            const report = await reportService.findReport({
                report_name: 'report_reverse_logistics'
            })

            await reportService.createReportLog({
                id: job.id,
                report_id: report.id,
                report_status:'INPROGRESS',
            })

            const root = global.appRoot;
            const fileName = moment().format('YYYYMMDDHHmmss')+'reverese_logitics.xlsx';
            const filePath = path.join(root,'/assets/reports/pre-billing/',fileName);
            
            const draftBill = await reportService.getDraftBill({
                service_type:'2004',
                trip_date: {
                    //[sequelize.Op.between]:['2024-01-01 00:00:00', '2024-01-31 00:00:00']
                    [sequelize.Op.between]:[filters.from,filters.to]
                },
            })

            const ascii = await asciiService.getSalesOrder(draftBill.length === 0 ? '' : draftBill.map(item => item.draft_bill_no))
            const asciiValidation = draftBill.filter(item => ascii.map(a => a.SO_CODE).includes(item.draft_bill_no))
            const generateCount = _.uniq(asciiValidation.map(item => item.draft_bill_no)).map((item,index) => ({
                draft_bill_no: item,
                count: index + 1
            }))
            
            const asciiEventDetails = await reportService.getAsciiEvents(_.uniq(asciiValidation.map(item => item.trip_plan)))

            const data = asciiValidation.map(item => {
                const count = generateCount.find(a => a.draft_bill_no === item.draft_bill_no)
                const eventDvry = asciiEventDetails.find(a => a.trip_log_id === item.trip_plan && a.to_location === item.to_stc && a.type === 'DELIVERY')
                const eventPckp = asciiEventDetails.find(a => a.trip_log_id === item.trip_plan && a.from_location === item.ship_from && a.type === 'PICKUP')
                return {
                    ...item,
                    ...count,
                    trip_rate: item.rate,
                    drvy_actual_datetime: eventDvry?.actual_datetime ?? null,
                    actual_datetime: eventPckp?.actual_datetime ?? null
                }
            })

            await reportService.reverseLogistics({
                data,
                filePath,
                dates:{
                    from: '2024-04-01',
                    to:'2024-04-15'
                }
            })
            
            job.progress('completed')
            done(null,{
                filePath,
                fileName
            }); 

        }
        catch(e){
            console.log(e)
            done(e)
        }
    })

    REPORT_REVERSE_LOGISTICS.on('completed', async(job) => {
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

    REPORT_REVERSE_LOGISTICS.on('failed', async(job,err) => {
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