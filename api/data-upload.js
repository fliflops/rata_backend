const router = require('express').Router();
const {tariff,contract,vendor,shipPoint} = require('../services');
const path = require('path');

router.post('/tariff',async(req,res)=>{
    try{
        let {data} = req.body;
        // console.log(data)
        if(typeof data.tariff === 'undefined'){
            return res.status(400).json({
                message:'Invalid File!'
            })
        }

        await tariff.bulkCreateTariff({
            data:data.tariff
        })

        res.status(200).end()

    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })
    }
})

router.post('/contract',async(req,res)=>{
    try{    
        const {data}=req.body
        const contracts = data.contracts;
        const details = data.contract_details;

        if(typeof data.contracts === 'undefined' || typeof data.contract_details === 'undefined'){
            return res.status(400).json({
                message:'Invalid File!'
            })
        }

        await contract.bulkCreateContractDetails({
            contract:contracts.filter(item => item.contract_id),
            details: details.filter(item => item.contract_id)
        })

        res.status(200).end()
    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })
    }
})

router.post('/vendor',async(req,res)=>{
    try{
        const {data} = JSON.parse(JSON.stringify(req.body));

        if(typeof data.vendor === 'undefined' || typeof data.vendor_group === 'undefined' || typeof data.vendor_group_details === 'undefined'){
            return res.status(400).json({
                message:'Invalid File!'
            })
        }

        await vendor.bulkCreateTransaction({
            vendor: data.vendor,
            vendorGroup:data.vendor_group,
            vendorGroupDetails:data.vendor_group_details
        })
    
        res.status(200).end()
    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })
    }
})

router.post('/ship-point',async(req,res)=>{
    try{
        const {data}=req.body
        if(typeof data.ship_point === 'undefined'){
            return res.status(400).json({
                message:'Invalid File!'
            })
        }

        await shipPoint.bulkCreateShipPoint({
            data:data.ship_point
        })

        // console.log(data.ship_point)

        res.status(200).end()
    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })
    }
})

router.get('/template',async(req,res)=>{
    try{
        const {type} = req.query    
       

        let pathName = null;
        if(type === '' || type === null || typeof type === 'undefined' ){
            return res.status(400).json({
                message:'Invalid Template Type'
            })
        }   
    
        pathName = path.join(path.resolve(__dirname,'..'),`/assets/templates/${type}_upload_template.xlsx`)
        res.download(pathName)

    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })
    }
    
})





module.exports = router;