const models = require('../models/rata');

exports.updateShipPoint = async(data) => {
    if(!data) throw 'ship point is required';

    const {stc_code,...shipPoint} = data;

    return await models.ship_point_tbl.update({
        ...shipPoint  
    },
    {
        where:{
            stc_code
        }
    })

}