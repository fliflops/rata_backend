const dataLayer = require('./dataLayer');

exports.getShipPoint = async({
    page,
    totalPage,
    search
}) => {
    try{
        const data = await dataLayer.getShipPoint({
            page,
            totalPage,
            search
        })

        
        return {
            count:data[0].count,
            data: data.filter((value,i) => i!==0)
        }
    }
    catch(e){
        throw e
    }
}

exports.bulkCreateShipPoint = async({data}) => {
    try{
        return await dataLayer.bulkCreateShipPoint({
            data,
            options:{
                logging:false,
                updateOnDuplicate:['updatedAt','country','stc_address','long','lat','region','province','city','barangay','zip_code']
            }
        })
    }
    catch(e){
        throw e
    }
}

exports.getAllShipPoint = async({filters}) => {
    try{
        return await dataLayer.getAllShipPoint({
            filters
        })
    }
    catch(e){
        throw e
    }
}