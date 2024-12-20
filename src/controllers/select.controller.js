
const geoService = require  ('../services/geography.service');
const serviceTypeService = require('../services/serviceType.service');
const models = require('../models/rata');
exports.getRegion = async(req,res,next) => {
    try{
        const data = await geoService.getRegion({
            ...req.query
        })

        res.json(data.map(item => {
            return {
                label:item.region_name,
                value:item.region_code,
                chipLabel:item.region_name
            }
        }))
    }
    catch(e){
        next(e)
    }
}

exports.getProvince = async(req,res,next) => {
    try{
        const data = await geoService.getProvince({
            ...req.query
        })

        res.json(data.map(item => {
            return {
                label:`Province: ${item.province_name}\nRegion: ${item.region_code}\nCountry: ${item.country_code}`,
                value:item.province_code,
                chipLabel:item.province_name
            }
        }))        

    }
    catch(e){
        next(e)
    }
}

exports.getCity = async(req,res,next) => {
    try{
        const data = await geoService.getCity({
            ...req.query
        })

        res.json(data.map(item => ({
            label:`City: ${item.city_name}\nProvince: ${item.province_code}\nRegion: ${item.region_code}\nCountry: ${item.country_code}`,
            value:item.city_code,
            chipLabel:item.city_name
        })))
    }
    catch(e){
        next(e)
    }
}

exports.getBrgy = async(req,res,next) => {
    try{
        const data = await geoService.getBrgy({
            ...req.query
        })

        res.json(data.map(item => ({
            label:`Barangay: ${item.barangay_name}\nCity: ${item.city_code}\nProvince: ${item.province_code}\nRegion: ${item.region_code}\nCountry: ${item.country_code}`,
            chipLabel:item.barangay_name,
            value:item.barangay_code
        })))

    }
    catch(e){
        next(e)
    }
}

exports.getAsciiDepartmentCode = async(req,res,next) => {
    try{
        const data = await serviceTypeService.getServiceType()
        
        res.status(200).json({
            data: data.map(item => ({
                label: item.service_type_desc,
                value: item.ascii_service_type
            }))
        })
    }
    catch(e){
        next(e)
    }
}

exports.getAlgorithm = async(req,res,next) => {
    try{
        const data = await models.agg_tbl.findAll().then(result => JSON.parse(JSON.stringify(result)));
    
        res.status(200).json({
            data: data.map(item => ({
                label: item.id,
                value: item.id
            }))
        })
    }
    catch(e){
        next(e)
    }
}