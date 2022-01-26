const router = require('express').Router();
const {dataDownload} = require('../services')

router.get('/draft-bill', async(req,res)=>{
    try{
        const {rdd,location,type} = req.query

        if(!rdd || !location || !type){
            return res.status(400).json({
                message:'Invalid Parameters'
            })
        }

        const data = await dataDownload.exportDraftBill({
            location,
            delivery_date:rdd,
            contract_type:type
        })

        res.status(200).json(data)
    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })
    }
})

router.get('/revenue-leak', async(req,res)=> {
    try{
        const {rdd,location,type} = req.query
        if(!rdd || !location || !type){
            return res.status(400).json({
                message:'Invalid Parameters'
            })
        }

        const data = await dataDownload.exportRevenueLeak({
            location,
            delivery_date:rdd, 
            contract_type:type
        })
        
        res.status(200).json(data)

    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })
    }
})

module.exports = router