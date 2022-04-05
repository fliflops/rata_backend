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

exports.getAllPrincipal = async({filters}) => {
    try{
        return await dataLayer.getAllPrincipal({filters});
    }
    catch(e){
        throw e
    }
}

exports.bulkCreatePrincipal = async({data}) => {
    try{
        return await dataLayer.bulkCreatePrincipal({data})
    }
    catch(e){
        throw e
    }
}