const router = require('express').Router();
const {draftBill,invoice} = require('../services')

router.get('/',async(req,res)=>{
    try{
        let query = req.query;
        /*Filters
            filters,
            orderBy,
            page,
            totalPage
        */
        const {count,rows} = await draftBill.getPaginatedDraftBill({
            filters:{
                ...query
            },
        })

        res.status(200).json({
            data:rows,
            rows:count
        })
    }
    catch(e){
        console.log(e)
        res.status(500).json({message:`${e}`})    
    }
})

router.get('/invoice/:draftBillNo',async(req,res)=>{
    try{
        const {draftBillNo} = req.params;

        const invoices = await draftBill.getAllInvoices({
            filters:{
                draft_bill_no:draftBillNo
            }
        })
        const header=await draftBill.getAllDraftBills({
            filters:{
                draft_bill_no:draftBillNo
            }
        })
        
        res.status(200).json({
            data:{
                header:header[0],
                invoices
            }
        })
    }
    catch(e){
        console.log(e)
        res.status(500).json({message:`${e}`})    
    }
})

router.get('/leakage',async(req,res)=>{
    try{
        let query = req.query;
        /*Filters
            filters,
            orderBy,
            page,
            totalPage
        */

        const {count,rows} = await invoice.getPaginatedRevenueLeak({
            filters:query
        })

        res.status(200).json({
            data:rows,
            rows:count
        })
    }
    catch(e){
        console.log(e)
        res.status(500).json({message:`${e}`})    
    }
})

module.exports = router;