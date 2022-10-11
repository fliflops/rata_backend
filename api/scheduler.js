const router = require('express').Router();
const schedulerService = require('../services/scheduler');
const wmsDraftBillService = require('../services/wms-draftbill/wms.draftbillService');
const {queue} = require('../jobs/bull/wms.auto.sync');
const {redis,ioredis} = require('../config');
const jobs = require('../jobs');
const moment = require('moment');

const connection = ioredis;

router.get('/',async(req,res)=> {
    try {
        const data = await schedulerService.getAllSchedulers({
            filters:{}
        })

        res.status(200).json({
            data
        })
    } 
    catch(e) {
        console.log(e)
        res.status(500).json({
            message:`${e}`
        });    
    }
})

router.route('/:id')
.get(async(req,res)=>{
    try{
        const query = req.query;
        const {id} = req.params;

        const {count,rows} = await schedulerService.getPaginatedJobsDetails({
            filters:{
                ...query,
                scheduler_id:id
            }
        })

        res.status(200).json({
            data:rows,
            rows:count
        })
    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        });  
    }
})
.put(async(req,res)=>{
    try{

        const {id} = req.params;
        const {data} = req.body;

        await schedulerService.updateScheduler({
            filters: {
                id
            },
            data
        })

        await redis.json.set(data.redis_key,'.',data)

        await jobs.wmsautosyncQueues.wmsAutoSyncProduce({
            date:moment().format('YYYY-MM-DD'),
            connection
        })
        
        console.log()

        res.status(200).end()
    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        });    
    }
})
.post(async(req,res)=> {
    try {
        const {id} = req.params;
        const body = req.body;

        if (id === 'WMS_DATA_SYNC') {
            //validation
            const details = await wmsDraftBillService.getAllDraftBillDetails({
                filters:{
                    transaction_date: moment(body.transaction_date).format('YYYY-MM-DD')
                }
            })

            if(details.length > 0){
                return res.status(400).json({
                    message:'Draft Bill Already Created!'
                })
            }

            await queue.wmsAutoSyncManual({
                date:moment(body.transaction_date).format('YYYY-MM-DD'),
                connection
            })
        }
        

        res.status(200).end()
    } 
    catch (e) {
        console.log(e)
        res.status(500).json({
            message:`${e}`
        });
    }
})

router.route('/details/:job_id')
.post(async(req,res) => {
    try{
        const {job_id} = req.params;

        res.status(200).end()
    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        });  
    }
})



// router.get('/bull', async(req,res) => {
//     try{
//         const {date} = req.query
//         // await schedulerService.producerBull()
//         await queue.wmsAutoSyncProduce({
//             date
//         })
//         res.status(200).send('done')
//     }
//     catch(e){
//         console.log(e)
//         res.status(500).json({
//             message:`${e}`
//         });  

//     }
// })

module.exports = router