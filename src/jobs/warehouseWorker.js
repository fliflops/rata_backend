const {WMS_DATA_SYNC,RATA_DRAFT_BILL_WMS} = require('./queues/queues');
const {getWMSData} = require('../../services/wms');
const wmsDraftBill = require('../../services/wms-draftbill');
const models = require('../models/rata');
const {sequelize} = models;
const {generateDraftBill} = wmsDraftBill;
const moment = require('moment');
const emailService =require ('../services/emailService');   

exports.wmsautosync = () => {
    const scheduler_id = 'WMS_DATA_SYNC';

    WMS_DATA_SYNC.process(async(job,done) => {
        try{
            const date = job.data.isRepeatable ? moment().format('YYYY-MM-DD') : job.data.date

            job.progress(1);
            
            await models.scheduler_auto_sync_trckr_tbl.createData({
                data:{
                    job_id:             job.id,
                    scheduler_id:       'WMS_DATA_SYNC',
                    transaction_date:   date,
                    job_status:         'INPROGRESS'
                }
            })

            const {header,details} = await getWMSData({
                date:date,
                jobId:job.id
            })

            job.progress(25)
                
            await sequelize.transaction(async t => {
                try{
                    await models.wms_data_header_tbl.bulkCreateData({
                        data:header.map(item => {
                            return {
                                ...item,
                                job_id: job.id
                            }
                        }),
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
            done(e)
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

        const getWmsData = await models.wms_data_header_tbl.getData({
            where:{
                job_id: job.id
            }
        })

        await emailService.sendEmail({
            subject:`${scheduler_id} Job: ${job.id}`,
            scheduler_id: scheduler_id,
            data:`<p>Job with id ${job.id} has been completed</p>
            <p>Fetched new WMS Data from WMS: <b>${getWmsData.length}</b></p>`
        })

        console.log(`Job with id ${job.id} has been completed`)
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

        await emailService.sendEmail({
            subject:`${scheduler_id} Job: ${job.id}`,
            scheduler_id,
            data:`Failed job with id ${job.id}`
        })

        console.error(err)
    })
}

exports.wmsdraftbill = () => {
    const scheduler_id = 'RATA_DRAFT_BILL_WMS'

    RATA_DRAFT_BILL_WMS.process(async(job,done) => {
        try{
            const date = job.data.isRepeatable ? moment().format('YYYY-MM-DD') : job.data.date

            job.progress(1);

            await models.scheduler_auto_sync_trckr_tbl.createData({
                data:{
                    job_id:             job.id,
                    scheduler_id:       scheduler_id,
                    transaction_date:   date,
                    job_status:         'INPROGRESS'
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
            
            await generateDraftBill({
                wms_data:data,
                transaction_date:date,
                job_id:job.id
            })

            job.progress(100);
            done()

        }
        catch(e){
            done(e)
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

        const getDraftBills = await models.wms_draft_bill_hdr_tbl.getData({
            where:{
                job_id: job.id
            }
        })

        const getRevenueLeak = await models.wms_rev_leak_tbl.getData({
            where:{
                job_id: job.id
            }
        })

        await emailService.sendEmail({
            subject:`${scheduler_id} Job: ${job.id}`,
            scheduler_id: scheduler_id,
            data:`<p>Job with id ${job.id} has been completed</p>
            <p>Created Draft Bills: <b>${getDraftBills.length}</b></p>
            <p>WMS Data with Revenue Leak: <b>${getRevenueLeak.length}</b></p>
            `
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

        await emailService.sendEmail({
            subject:`${scheduler_id} Job: ${job.id}`,
            scheduler_id,
            data:`Failed job with id ${job.id}`
        })

        console.error(err)
    })


}

