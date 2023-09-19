const models = require('../models/rata');

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