const models = require('../models/rata');
const useGlobalFilter = require('../helpers/filters');

exports.updateContract = async (data, stx) => {
    const {contract_id, ...contract} = data;

    return await models.contract_hdr_tbl.update({
        ...contract
    },{
        where:{
            contract_id
        },
        transaction: stx
    })

}

exports.createContractHistory = async ( data, stx) => {
    return await models.contract_history_tbl.create({
        ...data
    },
    {
        transaction: stx
    })
}

exports.getContract = async(filters) => {
    return await models.contract_hdr_tbl.findOne({
        where:{
            ...filters
        }
    })
}

exports.getContractDetails = async(query) => {
    const {
        contract_id,
        page,
        totalPage,
        search,
        ...filters
    } = query;

    const globalFilter = useGlobalFilter.defaultFilter({
        model: models.contract_tariff_dtl.getAttributes(),
        filters:{
            search
        }
    })

    return await models.contract_tariff_dtl.findAndCountAll({
        where:{
            contract_id,
            ...globalFilter,
            ...filters
        },
        order:[['createdAt','DESC']],
        offset: parseInt(page) * parseInt(totalPage),
        limit: parseInt(totalPage)
    })
    .then(result => {
        const {rows,count} = JSON.parse(JSON.stringify(result))
        return {
            rows:rows.map(item => ({
                ...item,
                rate_status: item.status
            })),
            count,
            pageCount: Math.ceil(count/totalPage)
        }
    })
}