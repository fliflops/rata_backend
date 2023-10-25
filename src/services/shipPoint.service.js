const APIError = require('../errors/api-error');
const models = require('../models/rata');

exports.updateShipPoint = async(data) => {
    if(!data) throw APIError('ship point is required');

    const {stc_code,...shipPoint} = data;

    console.log(shipPoint)

    return await models.ship_point_tbl.update({
        ...shipPoint  
    },
    {
        where:{
            stc_code
        }
    })

}

exports.getShipPoint = async(filters = {}) => {
    const data =  await models.ship_point_tbl.findOne({
        where:{
            ...filters
        }
    })

    return data ?  JSON.parse(JSON.stringify(data)) : null;
}