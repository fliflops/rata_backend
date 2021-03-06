const models = require('../../models');
const {sequelize,Sequelize} = models;

const getGeography = async({
    page,
    totalPage,
    search,
    sortBy,
    orderBy,
    filters
}) => {
    try{
        const {count,rows} = await models.geo_barangay_tbl.findAndCountAll({
            include:[
                {
                    model:models.geo_country_tbl,
                    attributes:["country_name"],
                    as:"country"
                },
                {
                    model:models.geo_region_tbl,
                    attributes:["region_name"],
                    as:"region"
                }
            ],
            where:{
                ...filters
            },
            offset:parseInt(page) * parseInt(totalPage),
            limit:parseInt(totalPage),
        })
        .then(result => {
            let {count,rows} = result
            rows = rows.map(item => {
                const {country,region,...newItem} = item.toJSON()
                
                return {
                    ...newItem,
                    country_name:item.country.country_name,
                    region_name:item.region.region_name
                }
            })
            return {count,rows}
        })

        return {
            count,
            rows
        }
    }
    catch(e){
        throw e
    }
}

const getGeoCountry = async({filters}) => {
    try{
        return await models.geo_country_tbl.findAll({
            where:{
                ...filters
            }
        })
        .then(result => JSON.parse(JSON.stringify(result)))
    }
    catch(e){
        throw e
    }
}

const getGeoRegion = async({filters}) =>{
    try{
        return await models.geo_region_tbl.findAll({
            where:{
                ...filters
            }
        })
        .then(result => JSON.parse(JSON.stringify(result)))
    }
    catch(e){
        throw e
    }  
}

const getGeoProvince = async({filters}) =>{
    try{
        return await models.geo_province_tbl.findAll({
            where:{
                ...filters
            }
        })
        .then(result => JSON.parse(JSON.stringify(result)))
    }
    catch(e){
        throw e
    }  
}

const getGeoCity = async({filters}) =>{
    try{
        return await models.geo_city_tbl.findAll({
            where:{
                ...filters
            }
        })
        .then(result => JSON.parse(JSON.stringify(result)))
    }
    catch(e){
        throw e
    }  
}

const getGeoBrgy = async({filters}) =>{
    try{
        return await models.geo_barangay_tbl.findAll({
            where:{
                ...filters
            }
        })
        .then(result => JSON.parse(JSON.stringify(result))) 
    }
    catch(e){
        throw e
    }  
}


module.exports = {
    getGeography,
    getGeoRegion,
    getGeoProvince,
    getGeoCity,
    getGeoBrgy,
    getGeoCountry
}