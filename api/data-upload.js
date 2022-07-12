const router = require('express').Router();
const {tariff,contract,vendor,shipPoint,geography, principal} = require('../services');
const locationService = require('../services/location')
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
        });
        const getBrgy =     await geography.getGeoBrgy({
            filters:{is_active:true}
        });
        const getShipPoint =   await shipPoint.getAllShipPoint({
            filters:{is_active:true}
        })

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

            // console.log({
            //     valid_from,
            //     valid_to,
            //     today,
            //     valid:moment(today).isBetween(valid_from,valid_to)
            // })

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

        let vendor_header=[]
        let vendor_group=[]
        let vendor_group_details=[]
        if(typeof data.vendor === 'undefined' || typeof data.vendor_group === 'undefined' || typeof data.vendor_group_details === 'undefined'){
            return res.status(400).json({
                message:'Invalid File!'
            })
        }

        const getVendor = await vendor.getAllVendor({
            filters:{
                vendor_id: data.vendor.map(item => item.vendor_id)
            }
        })

        const getVendorGroup = await vendor.getAllVendorGroup({
            filters:{
                vg_code :data.vendor_group.map(item =>item.vg_code)
            }
        })

        const getVendorGroupDetails = await vendor.getAllVendorGroupDtl({
            filters:{
                vg_code: _.uniq(data.vendor_group_details.map(item => item.vg_code))
            }
        })

        for(let i in data.vendor){
            const vendor = data.vendor[i]

            const isExist = _.find(getVendor,(value)=>{
                return value.vendor_id === vendor.vendor_id
            })

            if(isExist){
                vendor_header.push({
                    vendor_id: vendor.vendor_id,
                    reason:'Vendor already exists!'
                })

                continue;
            }
        }

        for(let i in data.vendor_group){
            const vendorGroup = data.vendor_group[i];

            const isExist = _.find(getVendorGroup,(value)=>{
                return value.vg_code === vendorGroup.vg_code
            })

            if(isExist){
                vendor_group.push({
                    vg_code: vendorGroup.vg_code,
                    reason:'Vendor Code already exists!'
                })

                continue;
            }

        }


        for(let i in data.vendor_group_details){
            const vendorGroupDetails = data.vendor_group_details[i];

            const isExist = _.find(getVendorGroupDetails,(value)=>{
                return value.vg_code === vendorGroupDetails.vg_code && value.vg_vendor_id === vendorGroupDetails.vg_vendor_id
            })

            console.log(isExist)

            if(isExist){
                vendor_group_details.push({
                    vg_code: vendorGroupDetails.vg_code,
                    vg_vendor_id: vendorGroupDetails.vg_vendor_id,
                    reason:'Vendor mapping exists!'
                })
            }
        }
        

        console.log(data.vendor_group_details)

        await vendor.bulkCreateTransaction({
            vendor:             data.vendor.filter(item => !vendor_header.map(x=>x.vendor_id).includes(item.vendor_id)),
            vendorGroup:        data.vendor_group.filter(item => !vendor_group.map(x=>x.vg_code).includes(item.vg_code)),
            vendorGroupDetails: data.vendor_group_details.filter(item => {
                const isInvalid = _.some(vendor_group_details,{
                    vg_code:item.vg_code,
                    vg_vendor_id:item.vg_vendor_id
                })

                return !isInvalid
            })
        })

        // await vendor.bulkCreateTransaction({
        //     vendor: data.vendor.map(item => {
        //         return {
        //             ...item,
        //             // created_by:req.session.userId
        //         }
        //     }),
        //     vendorGroup:data.vendor_group.map(item => {
        //         return {
        //             ...item,
        //             // created_by:req.session.userId
        //         }
        //     }),
        //     vendorGroupDetails:data.vendor_group_details.map(item => {
        //         return {
        //             ...item,
        //             // created_by:req.session.userId
        //         }
        //     })
        // })
    
        res.status(200).json({
            results:{
                vendor_header,
                vendor_group,
                vendor_group_details
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
        let shipPoint_validation = [];
        if(typeof data.ship_point === 'undefined'){
            return res.status(400).json({
                message:'Invalid File!'
            })
        }


        const allShipPoints = await shipPoint.getAllShipPoint({})

        const getRegion =   await geography.getGeoRegion({
            filters:{is_active:true}
        });
        const getProvince=  await geography.getGeoProvince({
            filters:{is_active:true}
        });
        const getCity=      await geography.getGeoCity({
            filters:{is_active:true}
        });

        // console.log(data.ship_point[0])
        for(const i in data.ship_point){
            const ship_point = data.ship_point[i]
            // console.log(ship_point)
            const isExists        = allShipPoints.filter(item => item.stc_code === ship_point.stc_code)
            const isRegionExists  = _.find(getRegion,   {region_code:   String(ship_point.region)})
            const isProviceExists = _.find(getProvince, {province_code: String(ship_point.province)})
            const isCityExists    = _.find(getCity,     {city_code:     String(ship_point.city)})
            
            if(isExists.length > 0){
                shipPoint_validation.push({
                    stc_code:ship_point.stc_code,
                    reason:'Ship Point already exists!'
                })
    
                continue;
            }

            if(!ship_point.stc_code){
                shipPoint_validation.push({
                    stc_code:ship_point.stc_code,
                    reason:'Ship Point code is required!'
                })
            }

            if(!ship_point.stc_description){
                shipPoint_validation.push({
                    stc_code:ship_point.stc_code,
                    reason:'Description is required!'
                })
            }

            if(!ship_point.stc_name){
                shipPoint_validation.push({
                    stc_code:ship_point.stc_code,
                    reason:'Ship Point name is required!'
                })
            }

            if(!isRegionExists){
                shipPoint_validation.push({
                    stc_code:ship_point.stc_code,
                    reason:`Region ${ship_point.region} does not exists!`
                })
            }

            if(!isProviceExists){
                shipPoint_validation.push({
                    stc_code:ship_point.stc_code,
                    reason:`Province ${ship_point.province} does not exists!`
                })

            }
            if(!isCityExists){
                shipPoint_validation.push({
                    stc_code:ship_point.stc_code,
                    reason:`City ${ship_point.city} does not exists!`
                })

            }

        }

        await shipPoint.bulkCreateShipPoint({
            data:_.differenceBy(data.ship_point,shipPoint_validation,'stc_code')
        })

        res.status(200).json({
            results:{
                ship_point_header:shipPoint_validation
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

router.post('/principal',async(req,res)=> {
    const {data}=req.body
    let principal_validation = []

    if(typeof data.principal === 'undefined'){
        return res.status(400).json({
            message:'Invalid File!'
        })
    }

    const allPrincipals = await principal.getAllPrincipal({
        filters:{
            is_active:true
        }
    })

    // console.log(allPrincipals)

    for(let i in data.principal){
        const principalData = data.principal[i];

        const isExists = allPrincipals.filter(item => item.principal_code === String(principalData.principal_code))
        // console.log(principalData)

        if(isExists.length > 0){
            principal_validation.push({
                principal_code:principalData.principal_code,
                reason:'Principal already exists!'
            })

            continue;
        }

        if(!principalData.principal_code){
            principal_validation.push({
                principal_code:principalData.principal_code,
                reason:'Principal code is required'
            })
        }

        if(!principalData.principal_name){
            principal_validation.push({
                principal_code:principalData.principal_code,
                reason:'Principal name is required'
            })
        }

        if(!principalData.ascii_principal_code){
            principal_validation.push({
                principal_code:principalData.principal_code,
                reason:'Principal code mapping to ascii is required!'
            })
        }
    }

    await principal.bulkCreatePrincipal({
        data:_.differenceBy(data.principal,principal_validation,'principal_code')
    })

    res.status(200).json({
        results:{
            principal:principal_validation
        }  
    })
})

router.post('/location',async(req,res)=>{
    try{
        const {data}=req.body
        let location_validation = [];

        if(typeof data.location === 'undefined'){
            return res.status(400).json({
                message:'Invalid File!'
            })
        }

        const allLocations = await locationService.getAllLocation({})
        

        for(let i in data.location){
            const location = data.location[i]
            
            const isExists = allLocations.filter(item => item.loc_code === String(location.loc_code))
            if(isExists.length > 0){
                location_validation.push({
                    loc_code:location.loc_code,
                    reason:'Location already exists!'
                })
    
                continue;
            }

            if(!location.loc_code){
                location_validation.push({
                    loc_code:location.loc_code,
                    reason:'Location Code is required!'
                })
            }

            if(!location.loc_name){
                location_validation.push({
                    loc_code:location.loc_code,
                    reason:'Location name is required!'
                })
            }

            if(!location.ascii_loc_code){
                location_validation.push({
                    loc_code:location.ascii_loc_code,
                    reason:'Location code mapping to ascii is required!'
                })
            }
        }

        await locationService.bulkCreateLocation({
            data:_.differenceBy(data.location,location_validation,'loc_code')
        })

        res.status(200).json({
            results:{
                location: location_validation
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