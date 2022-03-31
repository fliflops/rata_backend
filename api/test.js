const router = require('express').Router();
const testService    = require('../services/draftBill/draftBillTest');
const revenuLeakService = require('../services/revenueLeak');
router.get('/draft-bill/sell/:version',async(req,res)=>{
    try{
        const {version} = req.params
        const {location,rdd} = req.query

        let data; 
        if(version === 'v2'){
            
            data = await testService.generateDraftBillSell({
                deliveryDate:rdd,
                location
            })
        }
        else{
           data = await testService.generateDraftBillSellV1({
                deliveryDate:rdd,
                location
           }) 
        }

        res.status(200).json({
            data
        })

    }
    catch(e){
        console.log(e)
        res.status(500).json({message:`${e}`})    
    }
})

router.get('/revenue-leak/:contract_type',async(req,res)=>{
    try{
        const {contract_type} = req.params
        const {location,rdd}=req.query
    
        const data = await revenuLeakService.generateRevenueLeak({
            rdd,
            location,
            contract_type
        })
        
        res.status(200).json(data)
    }
    catch(e){
        console.log(e)
        res.status(500).json({message:`${e}`}) 
    }
})

module.exports = router 