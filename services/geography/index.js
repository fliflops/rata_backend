const dataLayer = require('./geographyDataLayer');

const getGeography = async ({
    page,
    totalPage,
    search,
    sortBy,
    orderBy,
    filters
}) => {
    try{
        
        const data = await dataLayer.getGeography({
            page,
            totalPage,
            search,
            sortBy,
            orderBy,
            filters
        })

        return data
    }
    catch(e){
        throw e
    }
}

const getGeoCountry = async({filters})=>{
    try{
        return await dataLayer.getGeoCountry({filters})
    }
    catch(e){
        throw e
    }
    
}

const getGeoRegion = async({filters}) =>{
    try{
        return dataLayer.getGeoRegion({filters})
    }
    catch(e){
        throw e
    }  
}

const getGeoProvince = async({filters}) =>{
    try{
        
        return await dataLayer.getGeoProvince({filters})

    }
    catch(e){
        throw e
    }  
}

const getGeoCity = async({filters}) =>{
    try{
        return await dataLayer.getGeoCity({filters})
    }   
    catch(e){
        throw e
    }  
}

const getGeoBrgy = async({filters}) =>{
    try{
        return await dataLayer.getGeoBrgy({filters})
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