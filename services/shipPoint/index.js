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