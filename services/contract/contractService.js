const dataLayer = require('./contractDatalayer');

exports.createContract = async({contract,details}) => {
    try{
        let contractData = contract;
        let detailsData = details;

        detailsData = detailsData.map(item => {
            return {
                ...item,
                contract_id:contractData.contract_id,
                modified_by:contractData.modified_by,
                created_by:contractData.created_by
            }
        })

        return await dataLayer.transactionCreateContract({
            contract:contractData,
            details:detailsData
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

exports.bulkCreateContractDetails = async({contract,details}) => {
    try{
        return await dataLayer.bulkCreateContractDetails({
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

