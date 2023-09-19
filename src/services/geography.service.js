const models = require('../models/rata');

exports.getRegion = async(filters) => {
    return await models.geo_region_tbl.findAll({
        where:{
            ...filters
        }
    }).then(result => JSON.parse(JSON.stringify(result)))
}

exports.getProvince = async(filters) => {
    return await models.geo_province_tbl.findAll({
        where:{
            ...filters
        }
    }).then(result => JSON.parse(JSON.stringify(result)))
}

exports.getCity = async(filters) => {
    return await models.geo_city_tbl.findAll({
        where:{
            ...filters
        }
    }).then(result => JSON.parse(JSON.stringify(result)))
}

exports.getBrgy = async(filters) => {
    return await models.geo_barangay_tbl.findAll({
        where:{
            ...filters
        }
    }).then(result => JSON.parse(JSON.stringify(result)))

}