const { rest } = require('lodash');
const vehicleTypeService = require('../services/vehicle_types.service');

exports.syncVehicleType = async(req,res,next) => {
    try{
        const data = await vehicleTypeService.syncVehicleTypes();

        res.status(200).json(data)
    }
    catch(e){
        next(e)
    }
}

exports.getPaginated = async(req,res,next) => {
    try{
        const query = req.query;
        const data = await vehicleTypeService.paginated(query);

        res.status(200).json({
            data: data.rows,
            rows:data.count,
            pageCount: data.pageCount
        })
    }
    catch(e){
        next(e)
    }
}