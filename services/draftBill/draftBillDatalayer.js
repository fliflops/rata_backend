const { result } = require('lodash');
const models = require('../../models');
const {sequelize,Sequelize} = models

const createDraftBillHeader = async({data,options}) => {
    try{
        return await models.draft_bill_hdr_tbl.bulkCreate(data,{
            ...options
        })
    }
    catch(e){
        throw e
    }
}

const createDraftBillInvoice = async({data,options}) => {
    try{
        return await models.draft_bill_invoice_tbl.bulkCreate(data,{
            ...options
        })
    }
    catch(e){
        throw e
    }
}

const createDraftBillTransaction = async({header,details}) => {
    try{
        return await sequelize.transaction(async t => {
            await createDraftBillHeader({
                data:header,
                options:{
                    transaction:t
                }
            })

            await createDraftBillInvoice({
                data:details,
                options:{
                    transaction:t
                }
            })
        })
    }
    catch(e){
        throw e
    }
}

const formatFilters = ({
    model,
    filters
}) => {
    try{

        let formattedFilters = filters;
        const attributes = Object.keys(model)
        Object.keys(filters).map(field => {
            if(field === 'delivery_date'){
                formattedFilters={
                    ...formattedFilters,
                    delivery_date: {
                        [Sequelize.Op.between]:filters.delivery_date.split(',')
                    }
                }
            }
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

const getPaginatedDraftBill = async({
    filters,
    orderBy,
    page,
    totalPage
}) => {
    try {
        
        let newFilter=formatFilters({
            model:models.draft_bill_hdr_tbl.rawAttributes,
            filters:filters
        });

        
        const {count,rows} = await models.draft_bill_hdr_tbl.findAndCountAll({
            where:{
                ...newFilter
            },
            offset:parseInt(page) * parseInt(totalPage),
            limit:parseInt(totalPage),
            //order: [[orderBy,desc]]
            order:[orderBy]
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
    catch (error) {
        throw error  
    }

}

const rawGetDraftBillCount = async({
    createdAt
}) => {
    try{
        return await sequelize.query(`
            Select count(*) rows from draft_bill_hdr_tbl
            where CAST(createdAt AS DATE) = :createdAt
        `,{
            replacements:{
                createdAt
            },
            type:Sequelize.QueryTypes.SELECT
        })
        .then(result => {
            return result[0].rows
        })
    }
    catch(e){
        throw e
    }

}

const getAllInvoices = async({filters})=>{
    try{
        return await models.draft_bill_invoice_tbl.findAll({
            where:{
                ...filters
            }
        })
        .then(result => JSON.parse(JSON.stringify(result)))
    }
    catch(e){
        throw e
    }
}

const getAllDraftBills = async({filters})=>{
    try{
        return await models.draft_bill_hdr_tbl.findAll({
            where:{
                ...filters
            }
        })
        .then(result=>JSON.parse(JSON.stringify(result)))
    }
    catch(e){
        throw e
    }
}


module.exports =  {
    createDraftBillInvoice,
    createDraftBillHeader,
    createDraftBillTransaction,
    getPaginatedDraftBill,
    rawGetDraftBillCount,
    getAllInvoices,
    getAllDraftBills
}
