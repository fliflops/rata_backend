const {Worker} = require('bullmq');
const Sequelize = require('sequelize')
const models = require('../../models/rata');
const heliosService = require('../../../services/Helios')
const redis = require('../../../config/redis')

const draftBillService = require('../../services/draftbillService')

exports.getTransportData = async(connection) => {
    try{
        const scheduler_id = 'TMS_DATA_SYNC'
        const worker = new Worker('rata:tmsautosync', async(job) => {
            try{

                //Note: Cancel the job if there's an existing transaction date inside the database
                const jobId = typeof job.opts.repeat?.jobId === 'undefined' ? job.id : job.opts.repeat.jobId
                
                await models.scheduler_auto_sync_trckr_tbl.createData({
                    data:{
                        job_id:jobId,
                        transaction_date:job.data.date,
                        scheduler_id:scheduler_id,
                        job_status:'INPROGRESS',
                    }
                })


                const invoice = await heliosService.bookings.getBookingRequest({
                    rdd: job.data.date
                })

                
                invoice.map(async item => {
                    await redis.json.set(`rata:transport_data:${item.tms_reference_no}`,'.',{
                        ...item
                    })
                })

                await models.helios_invoices_hdr_tbl.bulkCreateData({
                    data:invoice.map(item => {
                        return {
                            ...item,
                            job_id: jobId
                        }
                    }),
                    options:{
                        updateOnDuplicate: ['updatedAt','vehicle_type','vehicle_id','trip_no'],
                        include: models.helios_invoices_dtl_tbl,
                        logging:false
                    }
                })

            }
            catch(e){
                console.log(e)
                throw e
            }
        },
        {
            connection,
            maxStalledCount:0,
            //increase lock duration to 10 mins to prevent stalling of job
            lockDuration:600000
        })

        worker.on('completed', async job => {
            const jobId = typeof job.opts.repeat?.jobId === 'undefined' ? job.id : job.opts.repeat.jobId
            
            await models.scheduler_auto_sync_trckr_tbl.updateData({
                where:{
                    job_id:jobId
                },
                data:{
                    job_status:'COMPLETED'
                }
            })
            
            console.info(`${jobId} has completed!`);
        });

        worker.on('failed', async (job,err) => {
            const jobId = typeof job.opts.repeat?.jobId === 'undefined' ? job.id : job.opts.repeat.jobId
            
            await models.scheduler_auto_sync_trckr_tbl.updateData({
                where:{
                    job_id:jobId
                },
                data:{
                    job_status:'FAILED',
                    error_info: err.message
                }
            })
            
            console.info(`${jobId} has failed with ${err.message}`);
        })

    }
    catch(e){
        console.log(e)
        throw e
    }
}

exports.draftBillSell = async(connection) => {
    try{
        const scheduler_id = 'RATA_DRAFT_BILL_SELL'
        const worker = new Worker('rata:transport_draft_bill_sell', async(job) => {
            try{
                const jobId = typeof job.opts.repeat?.jobId === 'undefined' ? job.id : job.opts.repeat.jobId
                
                await models.scheduler_auto_sync_trckr_tbl.createData({
                    data:{
                        job_id:jobId,
                        transaction_date:job.data.date,
                        scheduler_id:scheduler_id,
                        job_status:'INPROGRESS',
                    }
                })

                const invoices = await models.helios_invoices_hdr_tbl.getData({
                    where:{
                        rdd: job.data.date,
                        is_processed_sell: 0
                    },
                    options:{
                        include:[
                           {model: models.helios_invoices_dtl_tbl},
                           {model: models.vendor_tbl},
                           {model: models.ship_point_tbl, as:'ship_point_from'},
                           {model: models.ship_point_tbl, as:'ship_point_to'}
                        ]
                    }
                })

                const {data,revenue_leak} = await draftBillService.sell({
                    invoices,
                    rdd: job.data.date
                })
            }
            catch(e){
                console.log(e)
                throw e
            }
        },
        {
            connection,
            maxStalledCount:0,

            //increase lock duration to 10 mins to prevent stalling of job
            lockDuration:600000
        })

        worker.on('completed', async job => {
            const jobId = typeof job.opts.repeat?.jobId === 'undefined' ? job.id : job.opts.repeat.jobId
            
            await models.scheduler_auto_sync_trckr_tbl.updateData({
                where:{
                    job_id:jobId
                },
                data:{
                    job_status:'COMPLETED'
                }
            })
            
            console.info(`${jobId} has completed!`);
        });

        worker.on('failed', async (job,err) => {
            const jobId = typeof job.opts.repeat?.jobId === 'undefined' ? job.id : job.opts.repeat.jobId
            
            await models.scheduler_auto_sync_trckr_tbl.updateData({
                where:{
                    job_id:jobId
                },
                data:{
                    job_status:'FAILED',
                    error_info: err.message
                }
            })
            
            console.info(`${jobId} has failed with ${err.message}`);
        })
    }
    catch(e){
        throw e
    }
}

exports.draftBillBuy = async(connection) => {
    try{
        const scheduler_id = 'RATA_DRAFT_BILL_BUY'
        const worker = new Worker('rata:transport_draft_bill_buy', async(job) => {
            try{
                const jobId = typeof job.opts.repeat?.jobId === 'undefined' ? job.id : job.opts.repeat.jobId
                
                await models.scheduler_auto_sync_trckr_tbl.createData({
                    data:{
                        job_id:jobId,
                        transaction_date:job.data.date,
                        scheduler_id:scheduler_id,
                        job_status:'INPROGRESS',
                    }
                })

                const invoices = await (models.helios_invoices_hdr_tbl.getData({
                    where:{
                        rdd: job.data.date,
                        is_processed_buy: 0
                    },
                    options:{
                        include:[
                            {model: models.ship_point_tbl, as:'ship_point_from'},
                            {model: models.ship_point_tbl, as:'ship_point_to'},
                            {model: models.helios_invoices_dtl_tbl},
                            {model: models.vendor_tbl},
                            {
                                model: models.vendor_group_dtl_tbl,
                                required: false,
                                where:Sequelize.where(Sequelize.col('vendor_group_dtl_tbl.location'),Sequelize.col('helios_invoices_hdr_tbl.location'))
                            },
                        ]
                    }
                }))
                .then(result => {
                    return result.map(item => {
                        const {
                            vendor_tbl,
                            vendor_group_dtl_tbl,
                            ...invoice
                        } = item;
        
                        return {
                            ...invoice,
                            vg_code:vendor_group_dtl_tbl?.vg_code || null,
                            is_ic: vendor_tbl?.is_ic || 0
                        }
                    })
                })

                const {data,revenue_leak} = await draftBillService.buy({
                    invoices,
                    rdd: job.data.date
                })
        
            }
            catch(e){
                throw e
            }
        },
        {
            connection,
            maxStalledCount:0,

            //increase lock duration to 10 mins to prevent stalling of job
            lockDuration:600000

        })
        
        worker.on('completed', async job => {
            const jobId = typeof job.opts.repeat?.jobId === 'undefined' ? job.id : job.opts.repeat.jobId
            
            await models.scheduler_auto_sync_trckr_tbl.updateData({
                where:{
                    job_id:jobId
                },
                data:{
                    job_status:'COMPLETED'
                }
            })
            
            console.info(`${jobId} has completed!`);
        });

        worker.on('failed', async (job,err) => {
            const jobId = typeof job.opts.repeat?.jobId === 'undefined' ? job.id : job.opts.repeat.jobId
            
            await models.scheduler_auto_sync_trckr_tbl.updateData({
                where:{
                    job_id:jobId
                },
                data:{
                    job_status:'FAILED',
                    error_info: err.message
                }
            })
            
            console.info(`${jobId} has failed with ${err.message}`);
        })
    }
    catch(e){
        throw e
    }
}
