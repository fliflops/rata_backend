const dataLayer = require('./contractDatalayer');

exports.createContract = async({contract,details}) => {
    try{

        return await dataLayer.createContract({
            data:contract
        })

        // let contractData = contract;
        //let detailsData = details;

        // detailsData = detailsData.map(item => {
        //     return {
        //         ...item,
        //         contract_id:contractData.contract_id,
        //         modified_by:contractData.modified_by,
        //         created_by:contractData.created_by
        //     }
        // })

        // return await dataLayer.transactionCreateContract({
        //     contract:contractData,
        //     //details:detailsData
        // })
    }
    catch(e){
        throw e
    }
}

exports.createContractTariff = async({
    data
}) => {
    try{
       return await dataLayer.createContractTariff({
           data
       }) 
    }
    catch(e){
        throw e
    }
}

exports.updateContractTariff = async({
    data,
    filters
})=>{
    try{
        return await dataLayer.updateContractDetails({
            data,
            filters
        })
    }
    catch(e){
        throw e
    }
}

exports.createContractDetails = async({
    data
}) => {
    try{
        let details = data

        details = details.map(item => {
            return {
                ...item,
                contract_id:contractData.contract_id,
                modified_by:contractData.modified_by,
                created_by:contractData.created_by
            }
        })

        return await dataLayer.bulkCreateContract({
            data:details
        })

    }
    catch(e){
        throw e
    }
}

exports.getPaginatedContract = async({
    page,
    totalPage,
    filters
}) => {
    try{

        return await dataLayer.getPaginatedContract({
            page,
            totalPage,
            filters
        })
    }
    catch(e){
        throw e
    }
}

exports.getContract = async({filters}) => {
    try {
        return await dataLayer.getContract({
            filters
        })
    } 
    catch (e) {
        throw e
    }
}

exports.getAllContracts = async({filters})=>{
    try{
        return await dataLayer.getAllContracts({
            filters
        })
    }
    catch(e){
        throw e
    }
}

exports.bulkCreateContractDetails = async({contract,details}) => {
    try{
        return await dataLayer.bulkCreateContractDetailsTransaction({
            contract,
            details
        })
    }
    catch(e){
        throw e
    }
}

exports.getContractDetails = async({filters})=>{
    try{
        return await dataLayer.getContractDetails({
            filters
        })
    }
    catch(e){
        throw e
    }
}

exports.getPaginatedContractTariff = async({
    filters,
    page,
    totalPage})=>
    {
        try{
            return await dataLayer.getPaginatedContractTariff({
                filters,
                page,
                totalPage
            })
        }
        catch(e){
            throw e
        }
}

exports.updateContractDetails = async({
    filters,
    data
}) => {
    try{
        return await dataLayer.updateContractDetails({
            data,
            filters
        })
    }
    catch(e){
        throw e
    }
}