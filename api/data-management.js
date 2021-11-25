const router = require('express').Router();
const {geography,principal,shipPoint} = require('../services')

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
        const {page,totalPage,search} = req.query;

        const getPrincipal = await principal.getPrincipal({
            page,
            totalPage,
            search
        })

        res.status(200).json({
            data:getPrincipal.data,
            totalRows:getPrincipal.count
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
        const {page,totalPage,search} = req.query;
        const data = await shipPoint.getShipPoint({
            page,
            totalPage,
            search
        })
        res.status(200).json({
            data:data.data,
            totalRows:data.count
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