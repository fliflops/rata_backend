const wmsService = require('../../../services/wms');
const wmsDraftBill = require('../../../services/wms-draftbill');
const schedulerService = require('../../../services/scheduler');
const {redis} = require('../../../config')
const{Queue,Worker} = require('bullmq');

// const wmsDraftBillService = wmsDraftBill.generateDraftBill

exports.wmsautosyncWorker = async(connection) => {
    try{
        const scheduler_id='WMS_DATA_SYNC'
    
        const worker = new Worker('rata:wmsautosync', async (job)=> {
            try{    

                //Note: Cancel the job if there's an existing transaction date inside the database
                const jobId = job.opts.repeat.jobId
                
                //create transaction log
                await schedulerService.createJobTracker({
                    data:{
                        job_id:jobId,
                        transaction_date:job.data.date,
                        scheduler_id:scheduler_id,
                        job_status:'INPROGRESS',
                    }
                })

                /* 1. get data from wms  */
                const wmsData = await wmsService.getWMSData({
                    date:job.data.date,
                    jobId:jobId
                })

                // 2. Backup the fetched data from wms to db
                await wmsService.bulkCreateWMSDataHeader({
                    data:wmsData
                })

                // 3. Generate Draft Bill
                await wmsDraftBill.generateDraftBill({
                    wms_data:wmsData,
                    transaction_date: job.data.date,
                    job_id:jobId
                })
            }
            catch(e){
                throw e
            }
        },{
            connection
        })

        worker.on('completed', async job => {
            await schedulerService.updateJobTracker({
                filters:{
                    job_id:job.opts.repeat.jobId
                },
                data:{
                    job_status:'COMPLETED'
                }
            })
            console.info(`${job.opts.repeat.jobId} has completed!`);
        });
   
        worker.on('failed', async (job, err) => {
            await schedulerService.updateJobTracker({
                filters:{
                    job_id:job.opts.repeat.jobId
                },
                data:{
                    job_status:'FAILED',
                    error_info: err.message
                }
            })
            console.error(`${job.opts.repeat.jobId} has failed with ${err.message}`);
        });

    }
    catch(e){
        throw e
    }
}


