const router = require('express').Router();
const {tariff,contract,vendor,shipPoint,geography} = require('../services');
const path = require('path');
const _ = require('lodash');
const moment = require('moment');

router.post('/tariff',async(req,res)=>{
    try{
        let {data} = req.body;
        
        let tariff_header = [];

        const getRegion =   await geography.getGeoRegion({
            filters:{is_active:true}
        });
        const getProvince=  await geography.getGeoProvince({
            filters:{is_active:true}
        });
        const getCity=      await geography.getGeoCity({
            filters:{is_active:true}
        }) ;
        const getBrgy =     await geography.getGeoBrgy({
            filters:{is_active:true}
        });
        const getShipPoint =   await shipPoint.getAllShipPoint({
            filters:{is_active:true}
        })

        // console.log(getShipPoint)

        //console.log(_.find(getCity,{city_code:'CALAMBA CITY'}))
        
        // console.log(getCity)

        if(typeof data.tariff === 'undefined'){
            return res.status(400).json({
                message:'Invalid File!'
            })
        }

        const {results} = await tariff.isTariffExists({
            tariff_ids:data.tariff.map(item => item.tariff_id)
        })

        for(let i in data.tariff){
            const tariff=data.tariff[i]
            const isExists=_.find(results,(value)=>{
                return value.tariff_id === tariff.tariff_id
            }) 

            if(isExists){
                tariff_header.push({
                    tariff_id:tariff.tariff_id,
                    reason:'Tariff Already Exists!'
                })
            }

            if(!tariff.service_type || tariff.service_type===''){
                tariff_header.push({
                    tariff_id:tariff.tariff_id,
                    reason:'Service Type is required'
                })
            }

            if(!tariff.location || tariff.location===''){
                tariff_header.push({
                    tariff_id:tariff.tariff_id,
                    reason:'Location is required'
                })
            }

            if(!tariff.from_geo_type || tariff.from_geo_type===''){
                tariff_header.push({
                    tariff_id:tariff.tariff_id,
                    reason:'From Geo Type is Required'
                })
            }

            if(!tariff.from_geo || tariff.from_geo===''){
                tariff_header.push({
                    tariff_id:tariff.tariff_id,
                    reason:'From Geo is Required'
                })
            }

            if(!tariff.to_geo_type || tariff.to_geo_type===''){
                tariff_header.push({
                    tariff_id:tariff.tariff_id,
                    reason:'To Geo Type is Required'
                })
            }

            if(!tariff.to_geo || tariff.to_geo===''){
                tariff_header.push({
                    tariff_id:tariff.tariff_id,
                    reason:'To Geo is Required'
                })
            }

            if(tariff.from_geo_type){
                let isFromGeoExist;
                if(String(tariff.from_geo_type).toLowerCase() === 'region'){
                    // console.log(tariff.from_geo_type)
                    isFromGeoExist  = _.find(getRegion,{region_code:tariff.from_geo})
                }
                if(String(tariff.from_geo_type).toLowerCase() === 'province'){
                    // console.log(tariff.from_geo_type)
                    isFromGeoExist  = _.find(getProvince,{province_code:tariff.from_geo})
                }
                if(String(tariff.from_geo_type).toLowerCase() === 'city'){
                    // console.log(tariff.from_geo_type)
                    isFromGeoExist  = _.find(getCity,{city_code:tariff.from_geo})
                }
                if(String(tariff.from_geo_type).toLowerCase() === 'barangay'){
                    // console.log(tariff.from_geo_type)
                    isFromGeoExist  = _.find(getBrgy,{barangay_code:tariff.from_geo})
                }
                if(String(tariff.from_geo_type).toLowerCase() === 'stc_code'){
                    // console.log(tariff.from_geo_type)
                    isFromGeoExist  = _.find(getShipPoint,  {stc_code:tariff.from_geo})
                }

                if(!isFromGeoExist){
                    tariff_header.push({
                        tariff_id:tariff.tariff_id,
                        reason:`Geo Type From ${tariff.from_geo_type}: ${tariff.from_geo} does not exists!`
                    })
                }
            }

            if(tariff.to_geo_type){
                let isToGeoExist;
                if(String(tariff.to_geo_type).toLowerCase() === 'region'){
                    isToGeoExist  = _.find(getRegion,{region_code:tariff.to_geo})
                }
                if(String(tariff.to_geo_type).toLowerCase() === 'province'){
                    isToGeoExist  = _.find(getProvince,{province_code:tariff.to_geo})
                }
                if(String(tariff.to_geo_type).toLowerCase() === 'city'){
                    isToGeoExist  = _.find(getCity,{city_code:tariff.to_geo})
                }
                if(String(tariff.to_geo_type).toLowerCase() === 'barangay'){
                    isToGeoExist  = _.find(getBrgy,{barangay_code:tariff.to_geo})
                }
                if(String(tariff.to_geo_type).toLowerCase() === 'stc_code'){
                    isToGeoExist  = _.find(getShipPoint,{stc_code:tariff.to_geo})
                    
                }

                if(!isToGeoExist){
                    tariff_header.push({
                        tariff_id:tariff.tariff_id,
                        reason:`Geo Type To ${tariff.to_geo_type}: ${tariff.to_geo} does not exists!`
                    })
                }
            }
        }

        
        await tariff.bulkCreateTariff({
            data:data.tariff.filter(item => !_.uniq(tariff_header.map(item => item.tariff_id)).includes(item.tariff_id))
        })

        res.status(200).json({
            results:{
                tariff_header
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

router.post('/contract',async(req,res)=>{
    try{    
        const {data}    = req.body;
        let contracts   = data.contracts;
        let details     = data.contract_details;
        const today     = moment().format('YYYY-MM-DD')

        let contract_header = []
        let contract_details = []

        if(typeof data.contracts === 'undefined' || typeof data.contract_details === 'undefined'){
            return res.status(400).json({
                message:'Invalid File!'
            })
        }

        //Contract Header validation
        const getContracts = await contract.getAllContracts({
            filters:{
                contract_id: contracts.map(item => item.contract_id)
            }
        })

        const getCustomers = await contract.getAllContracts({
            filters:{
                principal_code: contracts.map(item => item.principal_code)
            }
        })

        // console.log(getCustomers)

        for(let i in contracts){
            const contract = contracts[i];

            const dbContract = _.find(getContracts,(value)=>{
                return value.contract_id === contract.contract_id
            })

            const valid_from =  moment(contract?.valid_from).format('YYYY-MM-DD');
            const valid_to   =  moment(contract?.valid_to).format('YYYY-MM-DD');
            
            if(!moment(today).isBetween(valid_from,valid_to)){
                contract_header.push({
                    contract_id:contract.contract_id,
                    reason:'Invalid contract validity'
                })
            }

            if(!dbContract){
                continue;
            }

            if(dbContract?.contract_status === 'CANCELLED'){
                contract_header.push({
                    contract_id:contract.contract_id,
                    reason:'Cancelled Contract'
                })
            }

            const isCustomerExists = _.find(getCustomers,(value)=>{
                return value.principal_code == contract.principal_code
            }) 

            if(isCustomerExists && isCustomerExists?.contract_status === 'APPROVED'){
                contract_header.push({
                    contract_id:contract.contract_id,
                    reason:'Principal already mapped to a contract'
                })
            }
        }

        //Contract Tariff Validation
        const getTariffs = await tariff.getAllTariff({
            filters:{
                tariff_id:_.uniq(details.map(item => item.tariff_id))
            }
        })

        for(let i in details){
            const contract_tariff = details[i]

            const valid_from=moment(contract_tariff?.valid_from).format('YYYY-MM-DD')
            const valid_to=moment(contract_tariff?.valid_to).format('YYYY-MM-DD')

            const tariff = _.find(getTariffs,(value)=>{
                return value.tariff_id === contract_tariff.tariff_id
            })

            if(!tariff){
                contract_details.push({
                    contract_id:contract_tariff.contract_id,
                    tariff_id:contract_tariff.tariff_id,
                    reason:'Tariff does not exists!'
                })

                continue;
            }

            if(!moment(today).isBetween(valid_from,valid_to)){
                contract_details.push({
                    contract_id:contract_tariff.contract_id,
                    tariff_id:contract_tariff.tariff_id,
                    reason:'Invalid Tariff Validity'
                })
            }
        }

        await contract.bulkCreateContractDetails({
            contract:contracts.filter(item => !contract_header.map(x => x.contract_id).includes(item.contract_id)),
            details: details.filter(item => {
                const isInvalid = _.some(contract_details,{
                    contract_id:item.contract_id,
                    tariff_id:item.tariff_id
                })
    
                return !isInvalid
            })
        })

        res.status(200).json({
            results:{
                contract_header,
                contract_details
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

router.post('/vendor',async(req,res)=>{
    try{
        const {data} = JSON.parse(JSON.stringify(req.body));

        if(typeof data.vendor === 'undefined' || typeof data.vendor_group === 'undefined' || typeof data.vendor_group_details === 'undefined'){
            return res.status(400).json({
                message:'Invalid File!'
            })
        }

        await vendor.bulkCreateTransaction({
            vendor: data.vendor.map(item => {
                return {
                    ...item,
                    // created_by:req.session.userId
                }
            }),
            vendorGroup:data.vendor_group.map(item => {
                return {
                    ...item,
                    // created_by:req.session.userId
                }
            }),
            vendorGroupDetails:data.vendor_group_details.map(item => {
                return {
                    ...item,
                    // created_by:req.session.userId
                }
            })
        })
    
        res.status(200).json({
            results:{
                vendor_header:[],
                vendor_group:[],
                vendor_group_details:[]
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

router.post('/ship-point',async(req,res)=>{
    try{
        const {data}=req.body
        if(typeof data.ship_point === 'undefined'){
            return res.status(400).json({
                message:'Invalid File!'
            })
        }

        await shipPoint.bulkCreateShipPoint({
            data:data.ship_point.map(item => {
                return {
                    ...item,
                    // created_by:req.session.userId
                }
            })
        })

        // console.log(data.ship_point)

        res.status(200).json({
            results:{
                ship_point_header:[]
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