const models = require('../../models');
const moment = require('moment');
const {sequelize,Sequelize} = models;
const {viewFilters} = require('../../helper');
const { contract_tariff_dtl } = require('../../src/models/rata');

const getContract = async({
    filters,
    options
}) => {
    try{
        return await models.contract_hdr_tbl.findOne({
            include:[
                {
                    model:models.principal_tbl,
                    attributes:["principal_name"],
                    as:"principal"
                }
            ],
            where:{
                ...filters
            },
            ...options
        })
        .then(result => {
            if(result){
                const {principal,...newItem} = result.toJSON()
                return {
                    ...newItem,
                    principal_name: principal  === null ? null : principal.principal_name
                }
            }
            return result 
        })
    }
    catch(e){
        throw e
    }
}

const getWMSContract = async({
    filters,
    options
}) => {
    try{
        return await models.contract_wms_tbl.findOne({
            include:[
                {
                    model:models.principal_tbl,
                    attributes:["principal_name"],
                    as:"principal"
                }
            ],
            where:{
                ...filters
            },
            ...options
        })
        .then(result => {
            if(result){
                const {principal,...newItem} = result.toJSON()
                return {
                    ...newItem,
                    principal_name: principal  === null ? null : principal.principal_name
                }
            }
            return result 
        })
    }
    catch(e){
        throw e
    }
}

const getAllContracts= async({
    filters,
    options
}) => {
    try{
        return await models.contract_hdr_tbl.findAll({
            include:[
                {
                    model:models.principal_tbl,
                    attributes:["principal_name"],
                    as:"principal"
                }
            ],
            where:{
                ...filters
            },
            ...options
        })
        .then(result => {
            const data = JSON.parse(JSON.stringify(result))
            return data.map(item => {
                const {principal,...newItem} = item

                return {
                    ...newItem,
                    principal_name: principal?.principal_name
                }
            })
        })
    }
    catch(e){
        throw e
    }
}

const getAllWMSContracts= async({
    filters,
    options
}) => {
    try{
        return await models.contract_wms_tbl.findAll({
            include:[
                {
                    model:models.principal_tbl,
                    attributes:["principal_name"],
                    as:"principal"
                }
            ],
            where:{
                ...filters
            },
            ...options
        })
        .then(result => {
            const data = JSON.parse(JSON.stringify(result))
            return data.map(item => {
                const {principal,...newItem} = item

                return {
                    ...newItem,
                    principal_name: principal?.principal_name
                }
            })
        })
    }
    catch(e){
        throw e
    }
}

const getContractDetails = async({filters,options}) => {
    try{    
        return await models.contract_tariff_dtl.findAll({
            include:[
                {
                    model:models.agg_tbl,
                    attributes:['agg_name','with_agg','parameter','group_by'],
                    required:false,
                    as:"agg_rule"
                },
                {
                    model:models.tariff_sell_hdr_tbl,
                    where:{
                        tariff_status:'APPROVED'
                    },
                    required:false,
                    as:"tariff"
                },
                {
                    model:models.contract_hdr_tbl,
                    attributes:['vendor_group','contract_type','valid_from','valid_to'],
                    required:false,
                    as:'contract'
                }
            ],
            where:{
                ...filters
            },
            ...options
        })
        .then(result => {
            const data = result.map(i => {
                const {agg_rule,...item} = i.toJSON()

                return {
                    ...item,
                    agg_rule:agg_rule === null ? null : agg_rule.agg_name,
                    with_agg:agg_rule?.with_agg,
                    formula:agg_rule?.formula,
                    parameter:agg_rule?.parameter,
                    group_by:agg_rule?.group_by
                }   
            })

            return data
        })
    }
    catch(e){
        throw e
    }
}

const getAllWMSContractTariff = async({filters})=>{
    try {
        return await models.contract_tariff_wms_tbl.findAll({
            include:[
                {
                    model:models.agg_tbl,
                    attributes:['agg_name','with_agg','parameter','group_by'],
                    include:[{
                        model:models.agg_conditions_tbl,
                        required:false,
                        as:'conditions'
                    }],
                    where:{
                        status:'ACTIVE'
                    },
                    required:false,
                    as:"agg_rule"
                },
                {
                    model:models.tariff_wms_tbl,
                    where:{
                        tariff_status:'APPROVED'
                    },
                    required:false,
                    as:"tariff"
                },
                {
                    model:models.contract_wms_tbl,
                    attributes:['valid_from','valid_to'],
                    required:false,
                    as:'contract'
                }
            ],
            where:{
                ...filters
            }
        })
        .then(result => {
            const data = JSON.parse(JSON.stringify(result))
            return data.map(i => {
                const {agg_rule,...item} = i;

                return {
                    ...item,
                    agg_rule:agg_rule === null ? null : agg_rule.agg_name,
                    with_agg:agg_rule?.with_agg,
                    formula:agg_rule?.formula,
                    parameter:agg_rule?.parameter,
                    group_by:agg_rule?.group_by,
                    conditions:agg_rule?.conditions
                } 

            })
        })
    } 
    catch (e) {
        throw e    
    }
}

const getPaginatedContractTariff = async({
    filters,
    page,
    totalPage
    })=>{
        try{    

            const filter = viewFilters.globalSearchFilter({
                model:models.contract_tariff_dtl.rawAttributes,
                filters
            })

            return await models.contract_tariff_dtl.findAndCountAll({
                include:[
                    {
                        model:models.agg_tbl,
                        attributes:['agg_name','with_agg','parameter','group_by'],
                        required:false,
                        as:"agg_rule"
                    },
                    {
                        model:models.tariff_sell_hdr_tbl,
                        where:{
                            tariff_status:'APPROVED'
                        },
                        required:false,
                        as:"tariff"
                    },
                    {
                        model:models.contract_hdr_tbl,
                        attributes:['vendor_group','contract_type','valid_from','valid_to'],
                        required:false,
                        as:'contract'
                    }
                ],
                where:{
                    ...filter
                    // ...filters
                },
                offset:parseInt(page) * parseInt(totalPage),
                limit:parseInt(totalPage)
            })
            .then(result => {
                let {count,rows} = JSON.parse(JSON.stringify(result))
                
                rows = rows.map(i => {
                    const {agg_rule,...item} = i
                    
                    return {
                        ...item,
                        agg_rule:agg_rule === null ? null : agg_rule.agg_name,
                        with_agg:agg_rule?.with_agg,
                        formula:agg_rule?.formula,
                        parameter:agg_rule?.parameter,
                        group_by:agg_rule?.group_by
                    }  
                })
               
                return {
                    count,
                    rows
                }
            })
        }
        catch(e){
            throw e
        }
    
}

const getPaginatedWMSContractTariff=async({
    filters,
    page,
    totalPage,
    orderBy})=>{
    try{

        const filter = viewFilters.globalSearchFilter({
            model:models.contract_tariff_wms_tbl.rawAttributes,
            filters
        })

        return await models.contract_tariff_wms_tbl.findAndCountAll({
            include:[
                {
                    model:models.agg_tbl,
                    attributes:['agg_name','with_agg','parameter','group_by'],
                    required:false,
                    as:"agg_rule"
                },
                {
                    model:models.tariff_wms_tbl,
                    where:{
                        tariff_status:'APPROVED'
                    },
                    required:false,
                    as:"tariff"
                },
                {
                    model:models.contract_wms_tbl,
                    attributes:['valid_from','valid_to'],
                    required:false,
                    as:'contract'
                }
            ],
            where:{
                ...filter
            },
            offset:parseInt(page) * parseInt(totalPage),
            limit:parseInt(totalPage),
            order:orderBy
        })
        .then(result => {
            let {count,rows} = JSON.parse(JSON.stringify(result))
            
            rows = rows.map(i => {
                const {agg_rule,...item} = i
                
                return {
                    ...item,
                    agg_rule:agg_rule === null ? null : agg_rule.agg_name,
                    with_agg:agg_rule?.with_agg,
                    formula:agg_rule?.formula,
                    parameter:agg_rule?.parameter,
                    group_by:agg_rule?.group_by
                }  
            })
           
            return {
                count,
                rows
            }
        })



    }
    catch(e){
        throw e
    }
} 

const getPaginatedContract = async({
    filters,
    page,
    totalPage
}) => {
    try{
        //console.log(filters)

        let newFilter=viewFilters.globalSearchFilter({
            model:models.contract_hdr_tbl.rawAttributes,
            filters:{
                ...filters
            }
        });

        const {count,rows} = await models.contract_hdr_tbl.findAndCountAll({
            where:{
               ...newFilter
            },
            offset:parseInt(page) * parseInt(totalPage),
            limit:parseInt(totalPage)
        }) 
        .then(result => {
            let {count,rows} = JSON.parse(JSON.stringify(result))
            return {
                count,
                rows
            }
        })

        return {
            count,
            rows
        }
    }
    catch(e){
        throw e
    }
}

const getPaginatedWMSContract = async({
    filters,
    page,
    totalPage,
    orderBy
}) => {
    try{
        //console.log(filters)

        let newFilter=viewFilters.globalSearchFilter({
            model:models.contract_wms_tbl.rawAttributes,
            filters:{
                ...filters
            }
        });

        const {count,rows} = await models.contract_wms_tbl.findAndCountAll({
            include:[
                {
                    model:models.principal_tbl,
                    attributes:["principal_name"],
                    as:"principal"
                }
            ],
            where:{
               ...newFilter
            },
            offset:parseInt(page) * parseInt(totalPage),
            limit:parseInt(totalPage),
            order:orderBy
        }) 
        .then(result => {
            let {count,rows} = JSON.parse(JSON.stringify(result))
            return {
                count,
                rows
            }
        })

        return {
            count,
            rows
        }
    }
    catch(e){
        throw e
    }
}

const createContract = async({data,options}) => {
    try{
        const contract = await getContract({
            filters:{
                contract_id:data.contract_id
            },
            options
        })

        if(!contract){
            const {modified_by,approved_by,...newData} = data
            return await models.contract_hdr_tbl.create(newData,{
                ...options
            })
        }
        else{
            const {contract_id,created_by,approved_by,...filteredData} = data
             let newData;
            if(data.contract_status === 'APPROVED'){
                newData={
                    ...filteredData,
                    approved_by:data.approved_by,
                    approvedAt:moment().format("YYYY-MM-DD HH:mm:ss")
                }
            }
            else{
                newData={
                    ...filteredData
                }
            }

            return await updateContract({
                filter:{
                    contract_id:data.contract_id
                },
                data:{
                    ...newData
                },
                options
            })
        }
    }
    catch(e){
        throw e
    }
}

const createWMSContract = async({data,options}) => {
    try{
        const contract = await getWMSContract({
            filters:{
                contract_id:data.contract_id
            },
            options
        })

        if(!contract){
            const {updated_by,approved_by,...newData} = data
            return await models.contract_wms_tbl.create(newData,{
                ...options
            })
        }
        else{
            const {contract_id,created_by,approved_by,...filteredData} = data
             let newData;
            if(data.contract_status === 'APPROVED'){
                newData={
                    ...filteredData,
                    approved_by:data.approved_by,
                    approvedAt:moment().format("YYYY-MM-DD HH:mm:ss")
                }
            }
            else{
                newData={
                    ...filteredData
                }
            }

            return await updateWMSContract({
                filter:{
                    contract_id:data.contract_id
                },
                data:{
                    ...newData
                },
                options
            })
        }
    }
    catch(e){
        throw e
    }
}

const bulkCreateContractDetail= async({
    data,
    options
}) => {
    try{
        return await contract_tariff_dtl.bulkCreate(data,{
            ...options
        })
    }
    catch(e){
        throw e
    }
}

const bulkCreateContract = async({data,options}) => {
    try{
        return await models.contract_hdr_tbl.bulkCreate(data,{
            ...options
        })
    }
    catch(e){
        throw e
    }
}

const bulkCreateWMSContractDetail= async({
    data,
    options
}) => {
    try{

        return await models.contract_tariff_wms_tbl.bulkCreate(data,{
            ...options
        })
    }
    catch(e){
        throw e
    }
}

const bulkCreateWMSContract=async({data,options})=>{
    try{
        return await models.contract_wms_tbl.bulkCreate(
            data,
            {
                ...options
            }
        )
    }
    catch(e){
        throw e
    }
}

const updateContract = async({
    filter,
    data,
    options
}) => {
    try{
        return await models.contract_hdr_tbl.update({
            ...data
        },{
            where:{
                ...filter
            },
            ...options
        })
    }
    catch(e){
        throw e
    }
}

const updateWMSContract = async({
    filter,
    data,
    options
}) => {
    try{
        return await models.contract_wms_tbl.update({
            ...data
        },{
            where:{
                ...filter
            },
            ...options
        })
    }
    catch(e){
        throw e
    }
}

const updateContractDetails = async({
    filters,
    data,
    options
})=>{
    try{
        return await models.contract_tariff_dtl.update({
            ...data
        },{
            where:{
                ...filters
            },
            ...options
        })

    }
    catch(e){
        throw e
    }
}

const updateWMSContractTariff = async({filters,data}) => {
    try{
        return await models.contract_tariff_wms_tbl.update({
            ...data
        },
        {
            where:{
                ...filters
            }
        })
    }
    catch(e){
        throw e
    }
}

const createContractTariff = async({
    data
})=>{
    try{
        return await models.contract_tariff_dtl.create({
            ...data
        })
    }
    catch(e){
        throw e
    }
}

const createWMSContractTariff = async({data,options})=>{
    return await models.contract_tariff_wms_tbl.create({
        ...data
    })
}

const updateContractTariff = async({
    data,
    filters
}) => {
    try{
        return await models.contract_tariff_dtl.update({
            ...data
        },{
            where:{
                ...filters
            }
        })
    }
    catch(e){
        throw e
    }
}

const bulkCreateWMSContractDetailsTransaction = async({contract,details})=>{
    try {
        //console.log(details)
        return await sequelize.transaction(async t => {
            await bulkCreateWMSContract({
                data:contract,
                options:{
                    transaction: t,
                    logging:false,
                    ignoreUplicates:true
                    
                }
            })

            await bulkCreateWMSContractDetail({
                data:details,
                options:{
                    transaction: t,
                    logging:false,
                    ignoreUplicates:true
                    
                }
            })
        })
        
    } 
    catch (e) {
        throw e    
    }
}

const bulkCreateContractDetailsTransaction = async({contract,details}) => {
    try{
        return await sequelize.transaction(async t => {
            await bulkCreateContract({
                data:contract,
                options:{
                    logging:false,
                    updateOnDuplicate:['updatedAt'],
                    transaction: t
                }
            })

            await bulkCreateContractDetail({
                data:details,
                options:{
                    logging:false,
                    updateOnDuplicate:['updatedAt'],
                    transaction: t
                }
            }) 
        })
    }
    catch(e){
        throw e
    }
}

module.exports={
    createContract,
    getPaginatedContract,
    getContract,
    getAllContracts,
    getAllWMSContracts,
    getAllContracts,
    updateContract,
    getContractDetails,
    bulkCreateContractDetailsTransaction,
    bulkCreateContract,
    getPaginatedContractTariff,
    updateContractDetails,
    bulkCreateContractDetail,
    createContractTariff,
    updateContractTariff,
    updateWMSContractTariff,
    createWMSContract,
    getPaginatedWMSContract,
    getWMSContract,
    getAllWMSContracts,
    getAllWMSContractTariff,
    getPaginatedWMSContractTariff,
    createWMSContractTariff,
    bulkCreateWMSContractDetailsTransaction
}