const router = require('express').Router();
const {dataDownload} = require('../services')

router.get('/draft-bill', async(req,res)=>{
    try{
        const {from,to,location,type} = req.query

        if(!from || !to || !location || !type){
            return res.status(400).json({
                message:'Invalid Parameters'
            })
        }

        const data = await dataDownload.exportDraftBill({
            location,
            //delivery_date:rdd,
            from,
            to,
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
        const {from,to,location,type} = req.query
        if(!from || !to || !location || !type){
            return res.status(400).json({
                message:'Invalid Parameters'
            })
        }

        const data = await dataDownload.exportRevenueLeak({
            location,
            //delivery_date:rdd, 
            from,
            to,
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

router.get('/locations',async(req,res)=>{
    try{    
        const data = await dataDownload.exportLocation()
        res.status(200).json(data)
    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })
    }
})

router.get('/principal',async(req,res)=>{
    try{    
        const data = await dataDownload.exportPrincipal()
        res.status(200).json(data)
    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })
    }
})

router.get('/ship-point', async(req,res)=>{
    try{
        const data = await dataDownload.exportShipPoint()
        res.status(200).json(data)
    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })
    }
})

router.get('/vendor', async(req,res)=>{
    try{
        const data = await dataDownload.exportVendors()
        res.status(200).json(data)
    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })
    }
})

router.get('/contract-tariff/:contract', async(req,res)=>{
    try{

        const {from,to} = req.query;

        if(!from || !to){
            return res.status(400).json({
                message:'From and To Parameters are required!'
            })
        }

        const data = await dataDownload.exportContractTariff({
            contract_id:req.params.contract,
            from,
            to
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

router.get('/quick-code',async(req,res)=>{
    try{
        const data = await dataDownload.exportQuickCode()

        res.status(200).json(data)

    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })
    }
})

router.get('/algorithm',async(req,res)=>{
    try{
        const data = await dataDownload.exportAlgo()

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