const {WMS_DATA_SYNC,RATA_DRAFT_BILL_WMS} = require('./queues/queues');
const {getWMSData} = require('../../services/wms');
const wmsDraftBill = require('../../services/wms-draftbill');
const models = require('../models/rata');
const {sequelize} = models;
const {generateDraftBill} = wmsDraftBill;

exports.wmsautosync = () => {
    const scheduler_id = 'WMS_DATA_SYNC'
    WMS_DATA_SYNC.process(async(job,done) => {
        try{
            job.progress(1);
            
            await models.scheduler_auto_sync_trckr_tbl.createData({
                data:{
                    job_id:         job.id,
                    scheduler_id:   'WMS_DATA_SYNC',
                    transaction_date: job.data.date,
                    job_status: 'INPROGRESS'
                }
            })

            const {header,details} = await getWMSData({
                date:job.data.date,
                jobId:job.id
            })

            job.progress(25)
                
            await sequelize.transaction(async t => {
                try{
                    await models.wms_data_header_tbl.bulkCreateData({
                        data:header,
                        options:{
                            transaction:t,
                            ignoreDuplicates:true,
                            logging:false
                        }
                    })
    
                    job.progress(50)
    
                    await models.wms_data_details_tbl.bulkCreateData({
                        data:details,
                        options:{
                            transaction:t,
                            ignoreDuplicates:true,
                            logging:false
                        }
                    })    

                }
                catch(e){
                    throw e
                }
                
            })

            done();

            return header
        }
        catch(e){
            throw new Error(e)
        }
    })

    WMS_DATA_SYNC.on('completed',async (job) => {
        await models.scheduler_auto_sync_trckr_tbl.updateData({
            data:{
                job_status:'COMPLETED'
            },
            where: {
                job_id: job.id
            }
        })

        console.log(`Job with id ${job.id} has been completed`)
    })

    WMS_DATA_SYNC.on('error', (err) => {
        console.log(err)
    })

    WMS_DATA_SYNC.on('failed', async (job,err) => {
        await models.scheduler_auto_sync_trckr_tbl.updateData({
            data:{
                job_status:'FAILED',
                error_info: err.message
            },
            where: {
                job_id: job.id
            }
        })
        .catch(e => {
            console.log(e)
        })
        console.error(err)
    })
}

exports.wmsdraftbill = () => {
    const scheduler_id = 'RATA_DRAFT_BILL_WMS'

    RATA_DRAFT_BILL_WMS.process(async(job,done) => {
        try{
            job.progress(1);

            await models.scheduler_auto_sync_trckr_tbl.createData({
                data:{
                    job_id:         job.id,
                    scheduler_id:   scheduler_id,
                    transaction_date: job.data.date,
                    job_status: 'INPROGRESS'
                }
            })


            job.progress(35);

            const data = await models.wms_data_header_tbl.getData({
                options:{
                    include:[{
                        model:models.wms_data_details_tbl,
                        as:'details'
                    }]
                },
                where:{
                    transaction_date: job.data.date,
                    is_processed: 0
                }
            })

            job.progress(85);
            
            const draftBill = await generateDraftBill({
                wms_data:data,
                transaction_date:job.data.date,
                job_id:job.id
            })


            job.progress(100);
            done()

            return draftBill
        }
        catch(e){
            done(e)
            throw e
        }
    })

    //events

    RATA_DRAFT_BILL_WMS.on('completed',async (job) => {
        await models.scheduler_auto_sync_trckr_tbl.updateData({
            data:{
                job_status:'COMPLETED'
            },
            where: {
                job_id: job.id
            }
        })

        console.log(`Job with id ${job.id} has been completed`)
    })

    RATA_DRAFT_BILL_WMS.on('error', (err) => {
        console.log(err)
    })
    
    RATA_DRAFT_BILL_WMS.on('failed', async (job,err) => {
        await models.scheduler_auto_sync_trckr_tbl.updateData({
            data:{
                job_status:'FAILED',
                error_info: err.message
            },
            where: {
                job_id: job.id
            }
        })
        console.error(err)
    })


}

