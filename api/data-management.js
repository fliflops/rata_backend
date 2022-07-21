const router = require('express').Router();
const {geography,principal,shipPoint,location,quickCode,vendor} = require('../services')

router.get('/geography',async(req,res)=>{
    try{
        const {page,totalPage,search} = req.query;
        const getGeo = await geography.getGeography({
            page,
            totalPage,
            search
        })

        res.status(200).json({
            data:getGeo.rows,
            rows:getGeo.count
        })
    }
    catch(e){
        console.log(e)
        res.status(500).json({
            message:`${e}`
        })
    }
})

router.get('/geography/:variant',async(req,res) => {
    try{
        const {variant} = req.params;
        const {selected,city} = req.query;
        if(variant === 'country'){
            const data = await geography.getGeoCountry()
            return res.status(200).json({
                data
            })
        }
        if(variant === 'region'){
            const data = await geography.getGeoRegion({country:selected})
            return res.status(200).json({
               data
            })
        }

        if(variant === 'province'){
            const data= await geography.getGeoProvince({region:selected})
            return res.status(200).json({
                data
            })
        }

        if(variant === 'city'){
            const data= await geography.getGeoCity({province:selected})
            return res.status(200).json({
                data
            })
        }

        if(variant === 'barangay'){
            const data = await geography.getGeoBrgy({province:selected,city:city})
            return res.status(200).json({
                data:data
            })
        }

        return res.status(200).json({
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

router.get('/principal',async(req,res) => {
    try{
        let query = req.query;
        
        const {count,rows} = await principal.getPaginatedPrincipal({
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
        console.log(e);
        res.status(500).json({
            message:`${e}`
        })
    }
})

router.get('/ship-point',async(req,res) => {
    try{
        const query = req.query;
        const {count,rows} = await shipPoint.getPaginatedShipPoint({
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
        console.log(e);
        res.status(500).json({
            message:`${e}`
        })
    }
})

router.get('/location',async(req,res)=>{
    try {
        const query = req.query;
        const {count,rows} = await location.getPaginatedLocation({
            filters:{
                ...query
            }
        })

        res.status(200).json({
            data:rows,
            rows:count
        })
    } 
    catch (e) {
        console.log(e);
        res.status(500).json({
            message:`${e}`
        })
    }
})

router.get('/quick-code',async(req,res)=>{
    try {
        const query = req.query

        const {count,rows} = await quickCode.getPaginatedQuickCode({
            filters:{
                ...query
            }
        })

        res.status(200).json({
            data:rows,
            rows:count
        })
    } 
    catch (e) {
        console.log(e);
        res.status(500).json({
            message:`${e}`
        })
    }
})

router.get('/vendor',async(req,res)=>{
    try{

        const query = req.query;
        const {rows,count} = await vendor.getPaginatedVendor({
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
        console.log(e);
        res.status(500).json({
            message:`${e}`
        })
    }
})


module.exports = router;