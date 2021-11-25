const dataLayer = require('./principalDatalayer');

exports.getPrincipal = async({
    page,
    totalPage,
    search
}) => {
    try{
        const data = await dataLayer.getPrincipal({
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

exports.getAllPrincipal = async() => {
    try{
        return await dataLayer.getAllPrincipal();
    }
    catch(e){
        throw e
    }
}