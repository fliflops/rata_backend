const Joi = require('joi');

module.exports = {
    //POST
    post_tariff_ic:{
        body:Joi.object({
            tariff_id:      Joi.string().required(),
            vendor_group:   Joi.string().required(),
            vehicle_type:   Joi.string().required(),
            uom:            Joi.string().required(),
            min_value:      Joi.number().required(),
            max_value:      Joi.number().required(),
            rate:           Joi.number().required(),
            algo_status:    Joi.string().required()
        })
    },
    put_tariff_ic:{
        query: Joi.object({
            id: Joi.string().required(),
        }),
        body: Joi.object({
            algo_status:    Joi.string()
        })
    }
}