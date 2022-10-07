const dataLayer = require('./contractDatalayer');

exports.createContract = async({contract,details}) => {
    try{

        return await dataLayer.createContract({
            data:contract
        })
    }
    catch(e){
        throw e
    }
}

exports.createWMSContract = async ({contract}) => {
    try{
        
        return await dataLayer.createWMSContract({
            data:contract
        })
    } 
    catch (e) {
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

exports.createWMSContractTariff=async({data})=>{
    try{
        return await dataLayer.createWMSContractTariff({
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

exports.getPaginatedWMSContract=async({filters})=>{
    try {
        let {orderBy,order,page,totalPage,...newFilters} = filters;

        if(!orderBy){
            orderBy=[]
        }
        else{
            orderBy=[orderBy]
        }

        return await dataLayer.getPaginatedWMSContract({
            filters:newFilters,
            page,
            totalPage,
            orderBy
        })
        
    } 
    catch (e) {
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


exports.getWMSContract = async({filters}) => {
    try {
        return await dataLayer.getWMSContract({
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

exports.getAllWMSContracts = async({filters})=>{
    try{
        return await dataLayer.getAllWMSContracts({
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

exports.bulkCreateWMSContractDetails = async({contract,details}) => {
    try{
        return await dataLayer.bulkCreateWMSContractDetailsTransaction({
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


exports.getAllWMSContractTariff = async({filters})=>{
    try{
        return await dataLayer.getAllWMSContractTariff({
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
    totalPage})=>{
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

exports.getPaginatedWMSContractTariff=async({filters})=>{
    try{

        let {orderBy,order,page,totalPage,...newFilters} = filters;

        if(!orderBy){
            orderBy=[]
        }
        else{
            orderBy=[orderBy]
        }

        return await dataLayer.getPaginatedWMSContractTariff({
            filters:newFilters,
            page,
            totalPage,
            orderBy
        })    }
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

exports.updateWMSContractTariff = async({filters,data})=>{
    try{
        return await dataLayer.updateWMSContractTariff({
            filters,
            data
        })
    }
    catch(e){
        throw e
    }
}


