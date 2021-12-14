const router = require('express').Router();
const {draftBill,invoice, helios,ascii} = require('../services')
const {bookings} = helios

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

router.post('/:contract_type/invoice',async(req,res)=>{
    try{
        const {contract_type} = req.params;
        const {location,rdd} = req.query
        let draftBills;

        if(contract_type==='SELL'){
            draftBills = await draftBill.generateDraftBill({
                deliveryDate:rdd,
                location
            })

            //revenue leak
            await invoice.createRevenueLeak({
                data:draftBills.revenueLeak
            })
        }   
        else if(contract_type==='BUY'){
            draftBills = await draftBill.generateDraftBillBuy({
                rdd,
                location
            })

            //revenue leak
            // await invoice.createRevenueLeak({
            //     data:draftBills.revenueLeak
            // })
        }

        //console.log(draftBills)

        const create = await draftBill.createDraftBill(draftBills.draftBill)
     
        res.status(200).json({
            data:draftBills.draftBill,
            revenue_leak:draftBills.revenueLeak
        })

    }
    catch(e){
        console.log(e)
        res.status(500).json({message:`${e}`})
    }
})

router.post('/:contract_type/revenue-leak',async(req,res)=>{
    try{
        const {contract_type} = req.params;
        res.status(200).end()
    }
    catch(e){
        console.log(e)
        res.status(500).json({message:`${e}`})
    }
})

router.post('/helios',async(req,res)=>{
    try{
        const {rdd,location}=req.query;  

        const getInvoices   = await bookings.getInvoices({rdd,location})
        const getDetails    = await bookings.getInvoicesDtl({rdd,location})

        await invoice.createInvoiceTransaction({
            invoices:getInvoices,
            details:getDetails
        })

        res.status(200).json({
            data:getInvoices,
            details:getDetails
        })
    }
    catch(e){
        console.log(e)
        res.status(500).json({message:`${e}`})
    }
})

router.post('/ascii/sales-order',async(req,res)=>{
    try{
        const {rdd} = req.query
        //get the access token
        const token = await ascii.loginService()
        
        const data = await ascii.getDraftBill({
            rdd
        })

        const result = await ascii.createAsciiSalesOrder({
            token,
            data: JSON.parse(JSON.stringify(data))
        })

        // console.log(result.data)

        res.status(200).json({
            result: result.data,
            data
        })
    }
    catch(e){
        console.log(e)
        res.status(500).json({message:`${e}`})
    }
})

router.post('/ascii/confirmation-receipt',async(req,res)=>{
    try{
        const {rdd} = req.query

        const token = await ascii.loginService()
        const data = await ascii.getDraftBillBuy({
            rdd
        })

        const result = await ascii.createAsciiConfirmationReceipt({
            token,
            data
        })

        res.status(200).json({
            result: result.data,
            data
        })
    }
    catch(e){
        console.log(e)
        res.status(500).json({message:`${e}`})
    }
})


module.exports = router;