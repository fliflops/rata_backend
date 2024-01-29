const models = require('../models/rata');
const useGlobalFilter = require('../helpers/filters');

exports.createCostAlloc = async(data) => {
    await models.cost_alloc_setup_tbl.create(data)
}

exports.isCostAllocExists = async ({service_type, draft_bill_type}) => {
    
    const isExist = await models.cost_alloc_setup_tbl.findOne({
        where:{
            service_type: service_type,
            draft_bill_type: draft_bill_type
        }
    })

    return isExist
}


exports.updateCostAlloc = async(data={},where={}) => {
    return await models.cost_alloc_setup_tbl.update({
        ...data   
    },
    {
        where
    })
}


exports.getPaginatedCostAlloc = async(query) => {
    const {page,totalPage,search,...filters} = query;

    const globalFilter = useGlobalFilter.defaultFilter({
        model: models.cost_alloc_setup_tbl.getAttributes(),
        filters:{
            search
        }
    })

    const {count, rows} = await models.cost_alloc_setup_tbl.findAndCountAll({
        where:{
            ...globalFilter
        },
        order:[['createdAt','DESC']],
        offset: parseInt(page) * parseInt(totalPage),
        limit: parseInt(totalPage),

    })
    .then(result => JSON.parse(JSON.stringify(result)))

    return {
        count,
        rows,
        pageCount: Math.ceil(count/totalPage)
    }
}

exports.getPaginatedCostAllocDetails = async(query) => {
    const {page,totalPage,search,draft_bill_no,...filters} = query;

    const globalFilter = useGlobalFilter.defaultFilter({
        model: models.draft_bill_cost_alloc_tbl.getAttributes(),
        filters:{
            search
        }
    })

    const {count, rows} = await models.draft_bill_cost_alloc_tbl.findAndCountAll({
        where:{
            ...globalFilter,
            draft_bill_no
        },
        order:[['createdAt','DESC']],
        offset: parseInt(page) * parseInt(totalPage),
        limit: parseInt(totalPage),

    })
    .then(result => JSON.parse(JSON.stringify(result)))

    return {
        count,
        rows,
        pageCount: Math.ceil(count/totalPage)
    }
}