const { result } = require('lodash');
const models = require('../../models');
const moment = require('moment')
const {sequelize,Sequelize} = models;
const {defaultFilter} = require('../../helper/useFormatFilters')

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



// const formatFilters = ({
//     model,
//     filters
// }) => {
//     try{

//         let formattedFilters = filters;
//         const attributes = Object.keys(model)
//         Object.keys(filters).map(field => {
//             if(field === 'delivery_date'){
//                 const rdd = filters.delivery_date.split(',')
//                 formattedFilters={
//                     ...formattedFilters,
//                     delivery_date:{
//                         [Sequelize.Op.between]:rdd
//                         //[moment(rdd[0]).format('YYYY-MM-DD'),moment(rdd[1]).format('YYYY-MM-DD')]
//                     }
//                 }

//                 delete formattedFilters['delivery_date']
//             }
//             if(field==='search'){
//                 let fields = {}
//                 attributes.map(item => (fields[item] = filters.search))
//                 formattedFilters={
//                     ...formattedFilters,
//                     [Sequelize.Op.or]:fields
//                 }

//                 delete formattedFilters["search"]
//             }
//         })

//         return formattedFilters

//     }
//     catch(e){
//         throw e
//     }
// }

const getPaginatedDraftBill = async({
    filters,
    orderBy,
    page,
    totalPage
}) => { 
    try {
        
        let newFilter=defaultFilter({
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
            order:[['createdAt','DESC']]
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
            include:[
                {
                    model:models.draft_bill_hdr_tbl,
                    attributes:['contract_type'],
                    as:'header'
                }
            ],
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
            include:[
                {
                    model:models.location_tbl,
                    attributes:['ascii_loc_code'],
                    required:false,
                    as:'location_tbl'
                },
                {
                    model:models.vendor_tbl,
                    attributes:['ascii_vendor_code'],
                    required:false,
                    as:'vendor_tbl'
                },
                {
                    model:models.principal_tbl,
                    attributes:['ascii_principal_code','ascii_customer_code'],
                    required:false,
                    as:'principal_tbl'
                }
            ],
            where:{
                ...filters
            }
        })
        .then(result=>{
            data = JSON.parse(JSON.stringify(result))
            // console.log(data)

            return data.map(item => {
                const {location_tbl,vendor_tbl,principal_tbl,...newItem} = item

                return {
                    ...newItem,
                    ascii_vendor_code: typeof  vendor_tbl?.ascii_vendor_code === 'undefined' ? null: vendor_tbl?.ascii_vendor_code,
                    ascii_loc_code: typeof location_tbl?.ascii_loc_code === 'undefined' ? null :location_tbl?.ascii_loc_code, 
                    ascii_principal_code: typeof principal_tbl?.ascii_principal_code === 'undefined' ? null : principal_tbl?.ascii_principal_code,
                    ascii_customer_code: typeof principal_tbl?.ascii_customer_code === 'undefined' ? null : principal_tbl?.ascii_customer_code
                }
            })
        })
    }
    catch(e){
        throw e
    }
}

const updateDraftBill = async({
    filters,
    options,
    data
}) => {
    try{
        return await models.draft_bill_hdr_tbl.update(
            {
                ...data
            },
            {
                where:{
                    ...filters
                },
                ...options
            }
        )
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
    getAllDraftBills,
    updateDraftBill,
}
