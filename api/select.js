const router = require('express').Router();
const {principal,shipPoint,quickCode,location,tariff,geography,aggregation,vendor,roles} = require('../services')

router.get('/principal',async(req,res) => {
    try{

        const data = await principal.getAllPrincipal({})
        const selectData = data.map(item => {
            return {
                label:`${item.principal_code}-${item.principal_name}`,
                value:item.principal_code
            }
        })

        res.status(200).json({
            data:selectData
        })
    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })
    }
})

router.get('/ship-point',async(req,res) => {
    try{

    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })    }
})

router.get('/location',async(req,res) => {
    try{
        const data = await location.getAllLocation({
            filters:{
                loc_status:'ACTIVE'
            }
        })
        const selectData = data.map(item => {
            return {
                label:item.loc_name,
                value:item.loc_code
            }
        })

        res.status(200).json({
            data:selectData
        })
    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })    
    }
})

router.get('/trucker',async(req,res)=> {
    try{    
        res.status(200).json({
            data:[]
        })

    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })    }
})

router.get('/quick-code',async(req,res) => {
    try{
        const {type} = req.query
        const data = await quickCode.getAllQuickCode({type})
        const selectData = data.map(item => {
            return {
                label:item.qc_name,
                value:item.qc_code
            }
        })

        res.status(200).json({
            data:selectData
        })

    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })    
    }
})

router.get('/tariff-types', async(req,res) => {
    try{
        const data = await tariff.getAllTariffTypes({})
        const selectData = await data.map(item => {
            return {
                label:item.tariff_desc,
                value:item.tariff_type
            }
        }) 

        res.status(200).json({
            data:selectData
        })
    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        }) 
    }
})

router.get('/wms-tariff', async(req,res)=> {
    try{

        const {type} = req.query;
        let data = null;

        data = await tariff.getAllWMSTariff({
            filters:{
                tariff_status:'APPROVED'
            }
        })

        .then(result => {
            return result.map(i => {
                return {
                    label:`${i.tariff_id}:${i.tariff_desc}`,
                    value:i.tariff_id
                }
            })
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

router.get('/tariff',async(req,res)=>{
    try{
        const {type} = req.query;
        let data = null;

        data= await tariff.getAllTariff({
            filters:{
                tariff_status:'APPROVED'
            }
        })
        .then(result => {
            return result.map(i => {
                return {
                    label:`${i.tariff_id}:${i.tariff_desc}`,
                    value:i.tariff_id
                }
            })
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

router.get('/geography',async(req,res) => {
    try{
        const {type} =req.query
        let data;
        let selectData;
        if(type === 'country'){
            data = await geography.getGeoCountry({})
            selectData = await data.map(item => {
                return {
                    label:item.country_name,
                    value:item.country_code,
                    chipLabel:item.country_name
                }
            }) 
        }
        
        if(type === 'region'){
            data = await geography.getGeoRegion({})
            selectData = await data.map(item => {
                return {
                    label:`Region: ${item.region_name}\nCountry: ${item.country_code}`,
                    value:item.region_code,
                    chipLabel:item.region_name
                }
            })
        }
        
        if(type === 'province'){
            data = await geography.getGeoProvince({})
            selectData = await data.map(item => {
                return {
                    label:`Province: ${item.province_name}\nRegion: ${item.region_code}\nCountry: ${item.country_code}`,
                    value:item.province_code,
                    chipLabel:item.province_name
                }
            })
        }
        
        if(type === 'city'){
            data = await geography.getGeoCity({})
            selectData = await data.map(item => {
                return {
                    label:`City: ${item.city_name}\nProvince: ${item.province_code}\nRegion: ${item.region_code}\nCountry: ${item.country_code}`,
                    value:item.city_code,
                    chipLabel:item.city_name
                }
            })
        }
        
        if(type === 'barangay'){
            data = await geography.getGeoBrgy({})
            selectData = await data.map(item => {
                return {
                    label:`Barangay: ${item.barangay_name}\nCity: ${item.city_code}\nProvince: ${item.province_code}\nRegion: ${item.region_code}\nCountry: ${item.country_code}`,
                    chipLabel:item.barangay_name,
                    value:item.barangay_code
                }
            })
        }

        res.status(200).json({
            data:selectData
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
    try{
        let data;

        data = await aggregation.getAllAggregation({
            filters:{
                status:'ACTIVE'
            }
        })
        
        res.status(200).json({
            data:data.map(item => {
                return {
                    label:item.agg_name,
                    value:item.id
                }
            })
        })
    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        }) 
    }
})

router.get('/vendor-group',async(req,res)=>{
    try{
        let data
        
        data = await vendor.getAllVendorGroup({
            filters:{
                vg_status:'ACTIVE'
            }
        })


        res.status(200).json({
            data:data.map(i => {
                return {
                    label:i.vg_code,
                    value:i.vg_desc
                }
            })
        })
        

    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })
    }
})

router.get('/ic-vendor',async(req,res)=>{
    try{
        const data = await vendor.getAllVendor({
            filters:{
                is_ic:1
            }
        })

        res.status(200).json({
            data:data.map(i => {
                return {
                    label:i.vendor_description,
                    value:i.vendor_id
                }
            })
        })


    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })   
    }
})

router.get('/roles',async(req,res)=>{
    try{    
        let data 

        data = await roles.getAllRoles({
            filters:{
                role_status:'ACTIVE'
            }
        })

        res.status(200).json({
            data:data.map(i => {
                return {
                    label:i.role_name,
                    value:i.role_id
                }
            })
        })

    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })
    }
})

module.exports = router