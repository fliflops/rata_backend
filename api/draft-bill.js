const router = require('express').Router();
const {
    draftBill,
    invoice, 
    helios,
    ascii, 
    contract,
    generateDraftBill,
    revenueLeak
} = require('../services')
const dataDownload = require('../services/dataDownload');
const test = require('../services/draftBill/draftBillTest');
const {bookings} = helios

router.get('/',async(req,res)=>{
    try{
        let query = req.query;
        /*Filtersf
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
            filters:{
                ...query,
                is_draft_bill:false
            }
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
        let revenue_leak;

        let header;
        let invoices;

        if(contract_type ==='SELL'){
            draftBills = await generateDraftBill.generateDraftBill({
                deliveryDate:rdd,
                location
            })

            const {data,invData} = await draftBill.createDraftBill(draftBills)
            
            revenue_leak = await revenueLeak.generateRevenueLeak({
                rdd,
                location,
                contract_type:'SELL',
                draft_bill_invoices:invData
                
            })

            header      =   data
            invoices    =   invData
        }
        else{

            draftBills = await generateDraftBill.generateDraftBillBuy({
                deliveryDate:rdd,
                location
            })

            const {data,invData} = await draftBill.createDraftBill(draftBills)

            revenue_leak = await revenueLeak.generateRevenueLeak({
                rdd,
                location,
                contract_type:'BUY',
                draft_bill_invoices:invData
            })

            header      =   data
            invoices    =   invData
        }

        await generateDraftBill.createDraftBillTransaction({
            header,
            details: invoices,
            revenueLeak: revenue_leak.revenue_leaks,
            contract_type
        })

        res.status(200).json({
            draftBills,
            header,
            invoices: invoices,
            revenue_leak
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
        const {location,rdd} = req.query;

        let draftBills;
        let revenue_leak;

        let header;
        let invoices;

        if(contract_type === 'SELL'){
            draftBills = await generateDraftBill.replanDraftBill({
                deliveryDate:rdd,
                location
            })
            const {data,invData} = await draftBill.createDraftBill(draftBills)
            
            revenue_leak = await revenueLeak.generateRevenueLeakReplan({
                rdd,
                location,
                contract_type:'SELL',
                draft_bill_invoices:invData
            })

            header  = data
            invoices = invData
        }
        else{

            draftBills = await generateDraftBill.replanDraftBillBuy({
                deliveryDate:rdd,
                location
            })
            const {data,invData} = await draftBill.createDraftBill(draftBills)
            
            revenue_leak = await revenueLeak.generateRevenueLeakReplan({
                rdd,
                location,
                contract_type:'BUY',
                draft_bill_invoices:invData
            })

            header  = data
            invoices = invData
        }

        const get_revenue_leaks = await invoice.getAllRevenueLeak({
            filters:{
                draft_bill_type:contract_type,
                '$invoice.location$':   location,
                '$invoice.rdd$':        rdd,
                is_draft_bill:          false
            }
        })

        await revenueLeak.createRevenueLeakTransaction({
            header,
            details:        invoices,
            revenueLeak:    revenue_leak.revenue_leaks,
            oldRevenueLeak: get_revenue_leaks,
            contract_type
        })

        res.status(200).json({
            draftBills,
            header,
            invoices,
            revenue_leak
        })
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
        const invoices      = getInvoices.filter(item => !['SHORT_CLOSED'].includes(item.trip_status))

       const {inv_details} = await invoice.createInvoiceTransaction({
            invoices,
            details:getDetails
        })

        // console.log(invoices)

        res.status(200).json({
            data:invoices,
            details:inv_details
        })
    }
    catch(e){
        console.log(e)
        res.status(500).json({message:`${e}`})
    }
})

router.post('/ascii/sell',async(req,res)=>{
    try{
        const {rdd,location} = req.query;

        //get the access token
        const token = await ascii.loginService()
        const data = await ascii.getDraftBill({
            rdd,
            location
        })

        if(data.length === 0){
            return res.status(400).json({
                message:'No Data Found'
            })
        }

        const result = await ascii.createAsciiSalesOrder({
            token,
            data: JSON.parse(JSON.stringify(data))
        })

        //update draft bills
        await draftBill.updateDraftBill({
            data:{
                status:'DRAFT_BILL_POSTED',
                // updated_by:req.session.userId
            },
            filters:{
                draft_bill_no: result.success.map(item => item.SO_CODE),   
            }
        })

        // console.log(result)

        const xlsx = await dataDownload.generateTransmittalResult({
            success:result.success,
            errors:result.errors,
            data
        })

        res.status(200).json(xlsx)
    }
    catch(e){
        console.log(e)
        res.status(500).json({message:`${e}`})
    }
})

router.post('/ascii/buy',async(req,res)=>{
    try{
        const {rdd,location} = req.query

        const token = await ascii.loginService()
        const data = await ascii.getDraftBillBuy({
            rdd,
            location
        })

        if(data.length === 0){
            return res.status(400).json({
                message:'No Data Found'
            })
        }

        const result = await ascii.createAsciiConfirmationReceipt({
            token,
            data
        })
       
        await draftBill.updateDraftBill({
            data:{
                status:'DRAFT_BILL_POSTED',
                // updated_by:req.session.userId
            },
            filters:{
                draft_bill_no:result.success.map(item => item.CR_CODE),
            }
        })
  
        const xlsx = await dataDownload.generateTransmittalResult({
            success:result.success,
            errors:result.errors,
            data
        })
      
        res.status(200).json(xlsx)
    }
    catch(e){
        console.log(e)
        res.status(500).json({message:`${e}`})
    }
})


module.exports = router;