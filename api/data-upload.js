const router = require('express').Router();
const {tariff,contract,vendor} = require('../services');
const path = require('path');

router.post('/tariff',async(req,res)=>{
    try{
        let {data} = req.body;
        // console.log(data)
        await tariff.bulkCreateTariff({
            data:data.filter(item => item.tariff_id)
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
        //console.log(data)
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
        // console.log(req.body)

        if(typeof data.vendor === 'undefined'){
            return res.status(400).json({
                message:'Invalid File!'
            })
        }

        await vendor.bulkCreateVendor({
            data:data.vendor
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

        if(type === 'tariff'){
            pathName =  path.join(path.resolve(__dirname,'..'),'/assets/templates/tariff_upload_template.csv')
        }

        if(type === 'contract'){
            pathName =  path.join(path.resolve(__dirname,'..'),'/assets/templates/contract_upload_template.xlsx')
        }

        if(type === 'vendor'){
            pathName =  path.join(path.resolve(__dirname,'..'),'/assets/templates/vendor_upload_template.csv')
        
        }

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