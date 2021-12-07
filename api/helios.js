const router = require('express').Router();
const {bookings} = require('../services/Helios');
const {draftBill, invoice} = require('../services');

const _ = require('lodash');

router.post('/invoices',async(req,res) => {
    try{
        const {dateFrom,dateTo} = req.query;
        // const getLatestInvoice = await invoice.getLatestInvoice()
        const getInvoices = await bookings.getInvoices({
            dateFrom,
            dateTo
        })

        const getDetails = await bookings.getInvoicesDtl({
            dateFrom,
            dateTo
        })

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
        res.status(500).json({
            message:`${e}`
        })
    }
})

router.post('/trips',async(req,res) => {
    try{

    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })
    }
})

router.get('/draft-bill',async(req,res) => {
    try{
        const {dateFrom,dateTo} = req.query;
        let deliveryDate= '2021-09-28'
        const bill = await draftBill.generateDraftBill({
            //deliveryDate: '2021-11-16'
            deliveryDate
        })
               
        const createDraftBill = await draftBill.createDraftBill(bill.draftBill)
        
        const createRevenueLeak = await invoice.createRevenueLeak({
            data:bill.revenueLeak
        })


        res.status(200).json(createDraftBill)

    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })
    }
})

router.get('/draft-bill/buy',async(req,res)=>{
    try {
        const {rdd} = req.query;
        //get invoices 

        const buy = await draftBill.generateDraftBillBuy({
            rdd
        })
        
        res.status(200).json({
            buy
        })
    } 
    catch (e) {
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })
    }

})

module.exports = router