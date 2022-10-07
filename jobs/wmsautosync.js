const wmsService = require('../services/wms');
const schedulerService = require('../services/scheduler');
const {ioredis} = require('../config')
const{Worker} = require('bullmq');

const connection =  ioredis

//jobs for wms_autosync
module.exports = async() => {
    try{
        const scheduler_id = 'WMS_DATA_SYNC'
        
        const worker = new Worker('rata:wmsautosync',async (job)=>{
            try{
                //create transaction log
                await schedulerService.createJobTracker({
                    data:{
                        job_id:job.id,
                        scheduler_id:scheduler_id,
                        job_status:'INPROGRESS',
                    }
                })
                
                //1. get data from wms
                const wmsData = await wmsService.getWMSData({
                    date:job.data.date,
                    jobId:job.id  
                })

                //2. Backup the fetched data from wms to db
                await wmsService.bulkCreateWMSDataHeader({
                    data:wmsData
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
                    job_id:job.id
                },
                data:{
                    job_status:'COMPLETED'
                }
            })

            console.info(`${job.id} has completed!`);
        });
   
        worker.on('failed', async (job, err) => {
            await schedulerService.updateJobTracker({
                filters:{
                    job_id:job.id
                },
                data:{
                    job_status:'FAILED'
                }
            })
            console.error(`${job.id} has failed with ${err.message}`);
        });
    }
    catch(e){
        throw e
    }
}



