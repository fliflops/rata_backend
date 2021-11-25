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

const getGeoCountry = async()=>{
    try{
        return await dataLayer.getGeoCountry()
    }
    catch(e){
        throw e
    }
    
}

const getGeoRegion = async({country}) =>{
    try{
        return dataLayer.getGeoRegion({country})
    }
    catch(e){
        throw e
    }  
}

const getGeoProvince = async({region}) =>{
    try{
        
        return await dataLayer.getGeoProvince({region})

    }
    catch(e){
        throw e
    }  
}

const getGeoCity = async({province}) =>{
    try{
        return await dataLayer.getGeoCity({province})
    }   
    catch(e){
        throw e
    }  
}

const getGeoBrgy = async({province,city}) =>{
    try{
        return await dataLayer.getGeoBrgy({province,city})
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