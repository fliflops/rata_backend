const router = require('express').Router();
const moment = require('moment')
// const { result } = require('lodash');
const {tariff,aggregation,contract} = require('../services');

router.post('/wms-tariff',async(req,res)=> {
    try{
        const {data}=req.body;

        //Check if tariff already exists
        const tariffData = await tariff.getAllWMSTariff({
            filters:{
                tariff_id:data.tariff_id
            }
        })

        if(tariffData.length > 0 && tariffData[0].tariff_status === 'APPROVED') {
            return res.status(400).json({
                message:'Tariff exists already approved!!'
            })
        }
        
        if(tariffData.length === 0){
            await tariff.createWMSTariff({
                data:{
                    ...data,
                    created_by:req.processor.id
                }
            })
        }
        else {
            let newData;

            if(data.tariff_status === 'APPROVED') {
                newData = {
                    ...data,
                    updated_by:req.processor.id,
                    approved_by:req.processor.id,
                    approved_date:moment().format("YYYY-MM-DD HH:mm:ss").toString()
                }
            }
            else {
                newData = {
                    ...data,
                    updated_by:req.processor.id
                }
            }

            await tariff.updateWMSTariff({
                filters:{
                    tariff_id:data.tariff_id
                },
                data:newData
            })
        }

        res.status(200).end()

    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })
    }
})

router.post('/tariff',async(req,res) => {
    try{
        const {data} = req.body;

        /*Validations*/
        //1. Check if tariff exists
        const {isExist,results} = await tariff.isTariffExists({
            tariff_ids:[data.tariff_id]
        })

        if(isExist && results[0].status === 'APPROVED'){
            return res.status(400).json({
                message:'Tariff exists and already approved!'
            })
        }
        
        await tariff.createTariff({
            data: {
                ...data,
                created_by:req.processor.id,
            }
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

router.post('/wms-contract',async(req,res)=> {
    try{
        const {data} = req.body;
        
        await contract.createWMSContract({
            contract:{
                ...data.contract,
                created_by:req.processor.id,
                updated_by:req.processor.id,
                approved_by:req.processor.id
            }
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

router.post('/contract',async(req,res) => {
    try{
        const {data} = req.body;
        // console.log(data)
        await contract.createContract({
            contract:{
                ...data.contract,
                created_by:req.processor.id,
                modified_by:req.processor.id,
                approved_by:req.processor.id
            }
            //details:data.details
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

router.post('/contract/:contract_id',async (req,res)=>{
    try{
        const {data} = req.body;
        const {contract_id} = req.params;

        
        // const userId = req.session.userId;

        if(contract_id === '' || !contract_id){
            return res.status(400).json({
                message:'Create Contract first!'
            })
        }
        //check if the tariff is assigned to the selected contract
        const tariff = await contract.getContractDetails({
            filters:{
                tariff_id:data.tariff_id,
                contract_id:contract_id
            }
        })

        if(tariff.length > 0){
            if(tariff[0].status === 'ACTIVE'){
                return res.status(400).json({
                    message:'Tariff exists and in active status!'
                })
            }            
        }

        //Assign Tariff
        await contract.createContractTariff({
            data:{
                ...data,
                contract_id,
                created_by:req.processor.id
                // created_by:req.session.userId
            }
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

router.post('/wms-contract/:contract_id',async(req,res)=>{
    try{
        const {data} = req.body;
        const {contract_id} = req.params;

        const contracts = await contract.getAllWMSContractTariff({
            filters:{
                // tariff_id:data.tariff_id,
                contract_id:contract_id
            }
        })

        const tariff = contracts.filter(item => item.tariff_id === data.tariff_id)

        if(tariff.length > 0){
            if(tariff[0].status === 'ACTIVE'){
                return res.status(400).json({
                    message:'Tariff exists and in active status!'
                })
            }            
        }

        //Assign Tariff
        await contract.createWMSContractTariff({
            data:{
                ...data,
                line_no: contracts.length,
                contract_id,
                created_by:req.processor.id
            }
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

router.post('/aggregation',async(req,res)=>{
    try{
        let {header,conditions} = req.body.data;
        const parameter = header.parameter ? header.parameter.map(item => item.value).join(',') : null
        const group_by = header.group_by ? header.group_by.map(item => item.value).join(',') :null
        header = {
            ...header,
            parameter,//parameter === '' ? null //parameter === '' ? null : parameter,
            group_by//group_by === '' ? null : group_by
        }
        await aggregation.createAggRules({
            header:{
                ...header,
                created_by:req.processor.id,
                // created_by:req.session.userId
            },
            conditions:conditions.map((item,index) => {
                return {
                    ...item,
                    line_no:index
                }
            })
        })

        // console.log(header,conditions)

        res.status(200).end()
    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })
    }
})

router.get('/wms-tariff',async(req,res)=>{
    try{
        const query = req.query;
        const {count,rows} = await tariff.getPaginatedWMSTariff({
            filters:query
        })

        res.status(200).json({
            data:rows,
            rows:count
        })

    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })
    }
})

router.get('/tariff',async(req,res)=>{
    try{    
        const {
            page,
            totalPage,
            ...filters
        } = req.query;

        const {count,rows} = await tariff.getPaginatedTariff({
            page,
            totalPage,
            filters
        })

        res.status(200).json({
            data:rows,
            rows:count
        })
    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })
    }
})


router.get('/contract',async(req,res)=>{
    try{
        /*Filters
            filters,
            orderBy,
            page,
            totalPage
        */

        // const {
        //     page,
        //     totalPage
        // } = req.query;


        const {page,totalPage,...filters} = JSON.parse(JSON.stringify(req.query))
       
    //    console.log(filters)
        const {count,rows} = await contract.getPaginatedContract({
            page,
            totalPage,
            filters:filters
        })

        res.status(200).json({
            data:rows,
            rows:count
        })
    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })

    }
})

router.get('/wms-contract',async(req,res)=>{
    try{
        const query = req.query;

        const {count,rows} = await contract.getPaginatedWMSContract({
            filters:{
                ...query
            }
        })

        res.status(200).json({
            data:rows,
            rows:count
        })
    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })

    }
})

router.get('/aggregation',async(req,res)=>{
    try {
        const {page,totalPage,...filters} = req.query
        
        const {count,rows} = await aggregation.getPaginatedAgg({
            page,
            totalPage,
            filters
        })

        res.status(200).json({
            data:rows,
            rows:count
        })

    } 
    catch (e) {
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })
    }
})

router.get(`/contract/:contract_id`,async(req,res)=>{
    try{
        const {contract_id} = req.params;
        // const {} = req.query

        // console.log(contract_id)
        const data = await contract.getContract({
            filters:{
                contract_id
            }
        })

        // const details = await contract.getContractDetails({
        //     filters:{
        //         contract_id
        //     }
        // })

        res.status(200).json({
            data:{
                contract:data,
                // details
            }
        })
    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        }) 
    }
})

router.get(`/wms-contract/:contract_id`,async(req,res)=>{
    try{
        const {contract_id} = req.params;

        const data = await contract.getWMSContract({
            filters:{
                contract_id
            }
        })

        res.status(200).json({
            data:{
                contract:data,
            }
        })
    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        }) 
    }
})

router.get('/tariff/:tariff_id',async(req,res)=>{
    try{
        const {tariff_id} = req.params
        const data = await tariff.getTariff({
            filters:{
                tariff_id
            }
        })

        res.status(200).json({
            data
        })
    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        }) 
    }
})

router.get('/:contract_id/wms-tariff',async(req,res)=>{
    try{
        const {contract_id} = req.params;
        const query = req.query;
        
        const {count,rows} = await contract.getPaginatedWMSContractTariff({
            filters:{
                contract_id,
                ...query
            }
        })

        res.status(200).json({
            rows:count,
            data:rows
        })
    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })
    }
})

router.get('/:contract_id/tariff',async(req,res)=>{
    try{
        const {contract_id} = req.params;
        const {page,totalPage,...filters} = req.query;
        
        const {count,rows} = await contract.getPaginatedContractTariff({
            filters:{
                contract_id,
                ...filters
            },
            page,
            totalPage
        })

        res.status(200).json({
            rows:count,
            data:rows
        })
    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })
    }
})

router.put('/tariff/:tariff_id',async(req,res)=>{
    try{
        const {tariff_id} = req.params;

        const tariffData = await tariff.getTariff({
            filters:{
                tariff_id
            }
        })

        if(!tariff_id){
            return res.status(400).json({
                message:'Tariff ID is Required'
            })
        }

        if(tariffData.tariff_status !== 'APPROVED'){
            return res.status(400).json({
                message:'Invalid Tariff Status'
            })
        }

        if(tariffData.contract){
            return res.status(400).json({
                message:'Tariff is already assigned'
            })
        }

        //update tariff
        await tariff.updateTariff({
            filters:{
                tariff_id
            },
            data:{
                ...req.body,
                modified_by:req.processor.id
            }
        })

        res.status(200).json({
            data:[]
        })
    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })
    }
})

router.put('/wms-tariff/:tariff_id',async(req,res)=>{
    try{
        const {tariff_id} = req.params;

        if(!tariff_id){
            return res.status(400).json({
                message:'Tariff ID is Required'
            })
        }

        const tariffData = await contract.getAllWMSContractTariff({
            filters:{
                tariff_id
            }
        })

        if(tariffData.length > 0){
            return res.status(400).json({
                message:'Tariff is already assigned'
            })
        }

        await tariff.updateWMSTariff({
            filters:{
                tariff_id:tariff_id
            },
            data:{
                ...req.body,
                updated_by:req.processor.id
            }
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

router.put('/contract/:contract_id/:tariff_id', async(req,res)=>{
    try{    
        const {contract_id,tariff_id} = req.params;

        await contract.updateContractTariff({
            data:{
                ...req.body,
                modified_by:req.processor.id,
                
            },
            filters:{
                status:'ACTIVE',
                contract_id,
                tariff_id
            }
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

router.put('/wms-contract/:contract_id/:tariff_id', async(req,res)=>{
    try {

        const {contract_id,tariff_id} = req.params;
        const data = req.body;

        await contract.updateWMSContractTariff({
            data:{
                ...data,
                updated_by:req.processor.id
            },
            filters:{
                status:'ACTIVE',
                contract_id,
                tariff_id
            }
        })

        res.status(200).end()
    } 
    catch (e) {
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })  
    }
})

module.exports = router;