const router         = require('express').Router();
const sequelize      = require('sequelize');
const invoiceService = require('../services/invoice');
const testService    = require('../services/draftBill/draftBillTest');
const revenuLeakService = require('../services/revenueLeak');
const contractService = require('../services/contract');
const generateDraftBill = require('../services/generateDraftBill')
const draftBillService = require('../services/draftBill');
const ascii = require('../services/ascii');
const moment = require('moment')
const {Op} = sequelize

router.get('/draft-bill/buy',async(req,res)=>{
    try{
        const {rdd,location} = req.query
        const draftBills = await generateDraftBill.generateDraftBillBuy({
            deliveryDate:rdd,
            location
        })

        const {data,invData} = await draftBillService.createDraftBill(draftBills)

        const revenue_leak = await revenuLeakService.generateRevenueLeak({
            rdd,
            location,
            contract_type:'BUY',
            draft_bill_invoices:invData
        })

        const header  = data
        const invoices = invData


        res.status(200).json({
            revenue_leak,
            header,
            invoices
        })
    }
    catch(e){
        console.log(e)
        res.status(500).json({message:`${e}`})    
    }
})

router.get('/draft-bill/sell',async(req,res)=>{
    try{
        const {location,rdd} = req.query

        const draftBills = await generateDraftBill.generateDraftBill({
            deliveryDate:rdd,
            location
        })

        const {data,invData} = await draftBillService.createDraftBill(draftBills)

        const revenue_leak = await revenuLeakService.generateRevenueLeak({
            rdd,
            location,
            contract_type:'SELL',
            draft_bill_invoices:invData
        })

        const header  = data
        const invoices = invData


        res.status(200).json({
            revenue_leak,
            header,
            invoices
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

router.get('/invoice',async(req,res)=>{
    try{
        const {rdd,location,contract_type} = req.query;

        const draftBills = await invoiceService.getAllInvoice({
            filters:{
                rdd,
                location,
                // is_processed_buy:true
            }
        })




        // res.status(200).json({
        //     header,
        //     invoices,
        //     revenue_leak
        // })

    }
    catch(e){
        console.log(e)
        res.status(500).json({message:`${e}`})
    }
})

router.get('/ascii',async(req,res)=>{
    try{

        const {rdd,location} = req.query;

        const token = await ascii.loginService()
        const data = await ascii.getDraftBillBuy({
            rdd,
            location
        })

        const result = await ascii.createAsciiConfirmationReceipt({
            token,
            data
        })

       res.status(200).json({
           data,
           result
       })
    }
    catch(e){
        console.log(e)
        res.status(500).json({message:`${e}`})

    }
})

router.get('/ascii/buy',async(req,res)=>{
    try{
        const {rdd,location} = req.query

        const data = await ascii.getDraftBillBuy({
            rdd,
            location
        })

       res.status(200).json(data)
    }
    catch(e){
        console.log(e)
        res.status(500).json({message:`${e}`})

    }
})

router.get('/replan/sell', async(req,res)=>{
    try{
        const {rdd,location} = req.query;

        
        let draftBills;
        let revenue_leak;

        let header;
        let invoices;

        draftBills = await generateDraftBill.replanDraftBill({
            deliveryDate:rdd,
            location
        })
        const {data,invData} = await draftBillService.createDraftBill(draftBills)
        
        revenue_leak = await revenuLeakService.generateRevenueLeakReplan({
            rdd,
            location,
            contract_type:'SELL',
            draft_bill_invoices:invData
        })

        header  = data
        invoices = invData

        // const get_revenue_leaks = await invoice.getAllRevenueLeak({
        //     filters:{
        //         draft_bill_type:'SELL',
        //         '$invoice.location$':   location,
        //         '$invoice.rdd$':        rdd,
        //         is_draft_bill:          false
        //     }
        // })

        res.status(200).json({
            draftBills,
            header,
            invoices,
            revenue_leak
        })


    }   
    catch(e){
        throw e
    }
})


module.exports = router 