const models = require('../../models');
const moment = require('moment');
const {sequelize,Sequelize} = models;

const formatFilters = ({
    model,
    filters
}) => {
    try{
        let formattedFilters = filters;
        const attributes = Object.keys(model)
        Object.keys(filters).map(field => {
            if(field==='search'){
                let fields = {}
                attributes.map(item => (fields[item] = filters.search))
                formattedFilters={
                    ...formattedFilters,
                    [Sequelize.Op.or]:fields
                }

                delete formattedFilters["search"]
            }
        })

        return formattedFilters

    }
    catch(e){
        throw e
    }
}

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
                // console.log(principal)
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
                    attributes:['vendor_group','contract_type'],
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

const getPaginatedContract = async({
    filters,
    page,
    totalPage
}) => {
    try{
        //console.log(filters)

        let newFilter=formatFilters({
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

const createContractDetail = async({
    data,
    options
}) => {
    try{

        return await models.contract_tariff_dtl.bulkCreate(data,{
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

const transactionCreateContract = async({contract,details}) => {
    try{
        return await sequelize.transaction(async t => {
            await createContract({
                data:contract,
                options:{
                    transaction: t
                }
            })
            console.log(details)

            await createContractDetail({
                data:details,
                options:{
                    transaction: t,
                    updateOnDuplicate:['fk_agg_id','tariff_rate','line_no','valid_from','valid_to','status','updatedAt','modified_by']
                }
            })
        })
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

const bulkCreateContractDetails = async({contract,details}) => {
    try{
        return await sequelize.transaction(async t => {
            await bulkCreateContract({
                data:contract,
                options:{
                    logging:false,
                    updateOnDuplicate:['updatedAt']
                }
            })

            await createContractDetail({
                data:details,
                options:{
                    logging:false,
                    updateOnDuplicate:['updatedAt']
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
    updateContract,
    getContractDetails,
    transactionCreateContract,
    bulkCreateContractDetails,
    bulkCreateContract
}