const {TMS_DATA_SYNC,RATA_DRAFT_BILL_BUY,RATA_DRAFT_BILL_SELL} = require('./queues/queues');
const heliosService = require('../../services/Helios');
const draftBillService = require('../services/draftbillService');
const emailService = require('../services/emailService');

const models = require('../models/rata');
const { sequelize,Sequelize } = require('../models/rata');
const moment = require('moment')

exports.tmsautosync = () => {
    const scheduler_id = 'TMS_DATA_SYNC';
    TMS_DATA_SYNC.process(async(job,done) => {
        try{
            const date = job.data.isRepeatable ? moment().format('YYYY-MM-DD') : job.data.date

            await models.scheduler_auto_sync_trckr_tbl.createData({
                data:{
                    job_id:             job.id,
                    scheduler_id:       scheduler_id,
                    transaction_date:   date,
                    job_status: 'INPROGRESS'
                }
            })

            const invoice = await heliosService.bookings.getBookingRequest({
                rdd: date
            })

            await sequelize.transaction( async t => {
                await models.helios_invoices_hdr_tbl.bulkCreateData({
                    data:invoice.header.map(item => {
                        return {
                            ...item,
                            job_id: job.id
                        }
                    }),
                    options:{
                        transaction:t,
                        updateOnDuplicate: ['updatedAt','vehicle_type','vehicle_id','trucker_id','trip_no','trip_status'],
                        logging:false
                    }
                })
    
                await models.helios_invoices_dtl_tbl.bulkCreateData({
                    data:invoice.details,
                    options:{
                        transaction:t,
                        ignoreDuplicates:true,
                        logging: false
                    }
                })
            })

            job.progress('completed')
            done()

        }
        catch(e){
            done(e)
        }
    })

    
    TMS_DATA_SYNC.on('completed',async (job) => {
        await models.scheduler_auto_sync_trckr_tbl.updateData({
            data:{
                job_status:'COMPLETED'
            },
            where: {
                job_id: job.id
            }
        })

        const getInvoices = await models.helios_invoices_hdr_tbl.getData({
            where:{
                job_id: job.id
            }
        })

        await emailService.sendEmail({
            subject:`Tranport Data Sync Job: ${job.id}`,
            scheduler_id: scheduler_id,
            data:`<p>Job with id ${job.id} has been completed</p>
            <p>Fetched new Invoices from POD: <b>${getInvoices.length}</b></p>`
        })

        console.log(`Job with id ${job.id} has been completed`)
    })

    TMS_DATA_SYNC.on('failed', async (job,err) => {
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

        await emailService.sendEmail({
            subject:`Tranport Data Sync Job: ${job.id}`,
            scheduler_id,
            data:`Failed job with id ${job.id}`
        })
    })
}

exports.transportSell = () => {
    const scheduler_id = 'RATA_DRAFT_BILL_SELL';
    RATA_DRAFT_BILL_SELL.process(async (job,done) => {
        try{
            
            const date = job.data.isRepeatable ? moment().format('YYYY-MM-DD') : job.data.date
            await models.scheduler_auto_sync_trckr_tbl.createData({
                data:{
                    job_id:             job.id,
                    scheduler_id:       scheduler_id,
                    transaction_date:   date,
                    job_status:         'INPROGRESS'
                }
            })

            const invoices = await models.helios_invoices_hdr_tbl.getData({
                where:{
                    rdd: date,
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
                rdd: date,
                job_id: job.id
            })

            done();
            return {data,revenue_leak}
            
        }
        catch(e){
            done(e)
        }
    })

    RATA_DRAFT_BILL_SELL.on('completed',async (job) => {
        await models.scheduler_auto_sync_trckr_tbl.updateData({
            data:{
                job_status:'COMPLETED'
            },
            where: {
                job_id: job.id
            }
        })

        const getDraftBills = await models.draft_bill_hdr_tbl.getData({
            where:{
                job_id: job.id
            }
        })

        const getRevenueLeak = await models.transport_rev_leak_hdr_tbl.getData({
            job_id: job.id
        })

        await emailService.sendEmail({
            subject:`Draft Bill Sell Job: ${job.id}`,
            scheduler_id: scheduler_id,
            data:`<p>Job with id ${job.id} has been completed</p>
            <p>Created Draft Bills: <b>${getDraftBills.length}</b></p>
            <p>Invoices with Revenue Leak: <b>${getRevenueLeak.length}</b></p>`
        })

        console.log(`Job with id ${job.id} has been completed`)
    })

    RATA_DRAFT_BILL_SELL.on('failed', async (job,err) => {
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
            subject:`Draft Bill Sell Job: ${job.id}`,
            scheduler_id,
            data:`Failed job with id ${job.id}`
        })

        console.error('Job failed ',err)
    })
}

exports.transportBuy = () => {
    const scheduler_id = 'RATA_DRAFT_BILL_BUY';
    RATA_DRAFT_BILL_BUY.process(async (job,done) => {
        try{
            
            const date = job.data.isRepeatable ? moment().format('YYYY-MM-DD') : job.data.date
            await models.scheduler_auto_sync_trckr_tbl.createData({
                data:{
                    job_id:             job.id,
                    scheduler_id:       scheduler_id,
                    transaction_date:   date,
                    job_status: 'INPROGRESS'
                }
            })

            const invoices = await (models.helios_invoices_hdr_tbl.getData({
                where:{
                    rdd: date,
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
    
            await draftBillService.buy({
                invoices,
                rdd: date,
                job_id: job.id
            })
    
            done()
        }
        catch(e){
            done(e)
        }
    })

    RATA_DRAFT_BILL_BUY.on('completed',async (job) => {
        await models.scheduler_auto_sync_trckr_tbl.updateData({
            data:{
                job_status:'COMPLETED'
            },
            where: {
                job_id: job.id
            }
        })

        const getDraftBills = await models.draft_bill_hdr_tbl.getData({
            where:{
                job_id: job.id
            }
        })

        const getRevenueLeak = await models.transport_rev_leak_hdr_tbl.getData({
            job_id: job.id
        })

        await emailService.sendEmail({
            subject:`Draft Bill Buy Job: ${job.id}`,
            scheduler_id: scheduler_id,
            data:`<p>Job with id ${job.id} has been completed</p>
            <p>Created Draft Bills: <b>${getDraftBills.length}</b></p>
            <p>Invoices with Revenue Leak: <b>${getRevenueLeak.length}</b></p>`
        })
        console.log(`Job with id ${job.id} has been completed`)
    })

    RATA_DRAFT_BILL_BUY.on('failed', async (job,err) => {
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
            subject:`Draft Bill Buy Job: ${job.id}`,
            scheduler_id,
            data:`Failed job with id ${job.id}`
        })

        console.error('Job failed ',err)
    })
}