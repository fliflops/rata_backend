const router = require('express').Router();
const sequelize = require('sequelize');
const testService    = require('../services/draftBill/draftBillTest');
const revenuLeakService = require('../services/revenueLeak');
const contractService = require('../services/contract');
const moment = require('moment')
const {Op} = sequelize

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

router.get('/contract',async(req,res)=>{
    try{
        const {rdd} = req.query;

        const contracts = await contractService.getContractDetails({
            filters:{
                '$contract.contract_type$':'SELL',
                '$contract.valid_from$':{
                    [Op.lte]:rdd
                },
                '$contract.valid_to$':{
                    [Op.gte]:rdd
                }
            }
        })
        .then(result => {
            let contract_tariff = result.map(item => {
                const {tariff,contract,...contractDtl} = item
        
                return {
                    ...contractDtl,
                    ...contract,
                    ...tariff,
                    valid_from: contractDtl?.valid_from || null,
                    valid_to:   contractDtl?.valid_to || null,
                }
            })
            .filter(item => {
                return  moment(rdd).isBetween(item.valid_from,item.valid_to)
            })

            return contract_tariff
        })

        res.status(200).json(contracts)

    }
    catch(e){
        console.log(e)
        res.status(500).json({message:`${e}`}) 
    }
})


module.exports = router 