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
    },
    tariff:Joi.object({
        tariff_id:          Joi.string().required(),
        tariff_desc:        Joi.string().required(),
        min_value:          Joi.string().empty('').default(null),
        max_value:          Joi.string().empty('').default(null),
        sub_service_type:   Joi.string().empty('').default(null),
        vehicle_type:       Joi.string().allow(null).empty(),
        min_billable_unit:  Joi.string().allow(null).empty(),
        class_of_store:     Joi.string().allow(null).empty(),
        service_type:       Joi.string().required(),
        location:           Joi.string().required(),
        from_geo_type:      Joi.string().required(),
        to_geo_type:        Joi.string().required(),
        from_geo:           Joi.string().required(),
        to_geo:             Joi.string().required(),
        tariff_status:      Joi.string().required(),
        // ic_data:            Joi.array().default([])
    }),
    tariff_approve: Joi.object({
        tariff_id:      Joi.string().required(),
        tariff_status:  Joi.string().required(),
        ic_data:        Joi.array().default([])
    })
}