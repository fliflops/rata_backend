const Joi = require('joi');

module.exports = Joi.object({
    page: Joi.string().required(),
    totalPage: Joi.string().required(),
    search: Joi.string().empty('').default(''),
    location: Joi.string().empty(''),
    service_type: Joi.string().empty(''),
    contract_type:Joi.string().empty(''),
    draft_bill_type:Joi.string().empty(''),
    customer:Joi.string().empty(''),
    delivery_date:Joi.string().empty(''),
    trip_date:Joi.string().empty(''),
    draft_bill_date:Joi.string().empty(''),
    status:Joi.string().empty(''),
    vendor:Joi.string().empty(''),
    vehicle_type:Joi.string().empty('')
}) 