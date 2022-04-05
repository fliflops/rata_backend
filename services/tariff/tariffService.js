const dataLayer = require('./tariffDatalayer');

exports.createTariffType = async({
    header,
    conditions
}) => {
    try{
        return await dataLayer.createTariffType({
            header,
            conditions
        })
    }
    catch(e){
        throw e
    }
}

exports.createTariff = async({
    data
}) => {
    try{
        return await dataLayer.createTariff({
            data   
        })
    }
    catch(e){
        throw e
    }
}

exports.bulkCreateTariff = async({data})=>{
    try{
        return await dataLayer.bulkCreateTariff({
            data: data.map(item => {
                return {
                    ...item,
                    from_geo_type:String(item.from_geo_type).toLowerCase(),
                    to_geo_type:String(item.to_geo_type).toLowerCase(),
                    tariff_status:'DRAFT'
                }
            }),
            options:{
                logging:false,
                updateOnDuplicate:['updatedAt','vehicle_type','from_geo_type','to_geo_type','from_geo','to_geo']
            }
        })
    }
    catch(e){
        throw e
    }
}

exports.hasNull = async(data) => {
    try{
        let nulls = []
        for(let item in data){
            if(data[item] == null || data[item] == ''){
                nulls.push(item)
            }
        }

        return nulls
    }
    catch(e){
        throw e
    }
}

exports.getAllTariffTypes = async({filters}) => {
    try{
        return await dataLayer.getAllTariffTypes({filters})
    }
    catch(e){
        throw e
    }
}

exports.getPaginatedTariff=async({
    filters,
    page,
    totalPage
})=>{
    try{
       return await dataLayer.getPaginatedTariff({
           filters,
           page,
           totalPage
       }) 
    }
    catch(e){
        throw e 
    }
}

exports.getTariff = async({filters})=>{
    try{
        return await dataLayer.getTariff({
            filter:filters
        })
    }
    catch(e){
        throw e
    }
}

exports.getAllTariff = async({filters}) => {
    try{
        // console.log(filters)
        return await dataLayer.getAllTariff({
            filters
        })
    }
    catch(e){
        throw e
    }
}

exports.updateTariff = async({filters,data})=>{
    try{
        return await dataLayer.updateTariff({
            filters,
            data
        })
    }
    catch(e){
        throw e
    }
}


//Validations

exports.isTariffExists = async({
    tariff_ids
})=>{
    try{
        console.log(tariff_ids)
        let isExist = false

        let results = await dataLayer.getAllTariff({
            filters:{
                tariff_id:tariff_ids
            }
        }).then(result => result)

        if(results.length > 0){
            isExist=true
        }

        return {
            isExist,
            results
        }

    }
    catch(e){
        throw e
    }
}